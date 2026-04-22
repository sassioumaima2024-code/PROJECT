<?php
namespace App\Controller;

use App\Entity\Review;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\SuspensionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class ReviewController extends AbstractController
{
    // POST /api/reviews — soumettre une note
    #[Route('/reviews', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function create(
        Request $req,
        EntityManagerInterface $em,
        UserRepository $userRepo,
        SuspensionService $suspension
    ): JsonResponse {
        $data = json_decode($req->getContent(), true);

        $provider = $userRepo->find($data['provider_id']);
        if (!$provider) {
            return $this->json(['error' => 'Prestataire introuvable'], 404);
        }

        $review = new Review();
        $review->setClient($this->getUser());
        $review->setProvider($provider);
        $review->setRating($data['rating']);
        $review->setComment($data['comment'] ?? null);

        $em->persist($review);

        // Si mauvaise note <= 2 étoiles
        if ($data['rating'] <= 2) {
            $provider->setBadRatingsCount($provider->getBadRatingsCount() + 1);
            $suspension->checkSuspension($provider);
        }

        // Mettre à jour la note moyenne
        $this->updateAverageRating($provider, $em);

        $em->flush();

        return $this->json(['message' => 'Avis soumis', 'id' => $review->getId()], 201);
    }

    // GET /api/reviews/{userId} — avis d'un prestataire
    #[Route('/reviews/{userId}', methods: ['GET'])]
    public function getByUser(int $userId, UserRepository $userRepo, EntityManagerInterface $em): JsonResponse
    {
        $provider = $userRepo->find($userId);
        if (!$provider) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $reviews = $em->getRepository(Review::class)->findBy(
            ['provider' => $provider],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn($r) => [
            'id'      => $r->getId(),
            'rating'  => $r->getRating(),
            'comment' => $r->getComment(),
            'client'  => $r->getClient()->getNomCommercial() ?? $r->getClient()->getEmail(),
        ], $reviews);

        return $this->json($data);
    }

    // GET /api/provider/reviews — mes avis (prestataire connecté)
    #[Route('/provider/reviews', methods: ['GET'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function myReviews(EntityManagerInterface $em): JsonResponse
    {
        $reviews = $em->getRepository(Review::class)->findBy(
            ['provider' => $this->getUser()],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn($r) => [
            'id'      => $r->getId(),
            'rating'  => $r->getRating(),
            'comment' => $r->getComment(),
        ], $reviews);

        return $this->json($data);
    }

    private function updateAverageRating(User $provider, EntityManagerInterface $em): void
    {
        $reviews = $em->getRepository(Review::class)->findBy(['provider' => $provider]);
        if (count($reviews) === 0) return;
        $avg = array_sum(array_map(fn($r) => $r->getRating(), $reviews)) / count($reviews);
        // Mettre à jour dans les services du prestataire
        $services = $em->getRepository(\App\Entity\Service::class)->findBy(['provider' => $provider]);
        foreach ($services as $service) {
            $service->setAverageRating(round($avg, 2));
        }
    }
}