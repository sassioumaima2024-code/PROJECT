<?php
namespace App\Controller;

use App\Entity\User;
use App\Entity\Service;
use App\Entity\Appointment;
use App\Entity\Review;
use App\Repository\UserRepository;
use App\Repository\AppointmentRepository;
use App\Repository\ReviewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('/dashboard/stats', methods: ['GET'])]
    public function dashboardStats(
        UserRepository $userRepo,
        AppointmentRepository $appointRepo,
        ReviewRepository $reviewRepo,
    ): JsonResponse {
        return $this->json([
            'totalUsers' => count($userRepo->findAll()),
            'totalProviders' => count($userRepo->findBy(['role' => 'prestataire'])),
            'totalClients' => count($userRepo->findBy(['role' => 'client'])),
            'totalAppointments' => count($appointRepo->findAll()),
            'thisMonthAppointments' => count($appointRepo->findThisMonth()),
            'totalReviews' => count($reviewRepo->findAll()),
            'averageRating' => $reviewRepo->getAverageRating(),
        ]);
    }

    #[Route('/providers', methods: ['GET'])]
    public function listProviders(UserRepository $repo, Request $req): JsonResponse
    {
        $status = $req->query->get('status'); // 'active', 'suspended', 'pending'
        $query = $repo->createQueryBuilder('u')
            ->where('u.role = :role')
            ->setParameter('role', 'prestataire');

        if ($status === 'active') {
            $query->andWhere('u.isActive = true');
        } elseif ($status === 'suspended') {
            $query->andWhere('u.isActive = false');
        } elseif ($status === 'pending') {
            $query->andWhere('u.isVerified = false');
        }

        $providers = $query->getQuery()->getResult();
        return $this->json(['data' => array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'nom_commercial' => $u->getNomCommercial(),
            'rating' => $u->getAverageRating(),
            'is_active' => $u->isActive(),
            'is_verified' => $u->isVerified(),
            'bad_ratings_count' => $u->getBadRatingsCount(),
        ], $providers)]);
    }

    #[Route('/providers/{id}/validate', methods: ['PATCH'])]
    public function validateProvider(User $provider, EntityManagerInterface $em): JsonResponse
    {
        if ($provider->getRole() !== 'prestataire') {
            return $this->json(['error' => 'Non un prestataire'], 400);
        }

        $provider->setIsVerified(true);
        $provider->setIsActive(true);
        $em->flush();

        return $this->json(['message' => 'Prestataire validé']);
    }

    #[Route('/providers/{id}/suspend', methods: ['PATCH'])]
    public function suspendProvider(User $provider, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        $reason = $data['reason'] ?? 'Raison non spécifiée';

        $provider->setIsActive(false);
        $provider->setMetadata(['suspension_reason' => $reason, 'suspended_at' => date('Y-m-d H:i:s')]);
        $em->flush();

        return $this->json(['message' => 'Prestataire suspendu']);
    }

    #[Route('/providers/{id}/reactivate', methods: ['PATCH'])]
    public function reactivateProvider(User $provider, EntityManagerInterface $em): JsonResponse
    {
        $provider->setIsActive(true);
        $provider->setBadRatingsCount(0);
        $em->flush();

        return $this->json(['message' => 'Prestataire réactivé']);
    }

    #[Route('/clients', methods: ['GET'])]
    public function listClients(UserRepository $repo): JsonResponse
    {
        $clients = $repo->findBy(['role' => 'client']);
        return $this->json(['data' => array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'phone' => $u->getPhone(),
            'created_at' => $u->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $clients)]);
    }

    #[Route('/users', methods: ['GET'])]
    public function listUsers(UserRepository $repo): JsonResponse
    {
        $users = $repo->findAll();
        return $this->json(array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'role' => $u->getRole(),
            'phone' => $u->getPhone(),
            'is_active' => $u->isActive(),
        ], $users));
    }

    #[Route('/users/{id}/toggle', methods: ['PATCH'])]
    public function toggleUser(User $user, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        if (isset($data['is_active'])) {
            $user->setIsActive((bool) $data['is_active']);
            $em->flush();
        }
        return $this->json(['message' => 'Statut utilisateur mis à jour']);
    }

    #[Route('/appointments', methods: ['GET'])]
    public function listAppointments(AppointmentRepository $repo, Request $req): JsonResponse
    {
        $status = $req->query->get('status');
        $query = $repo->createQueryBuilder('a');

        if ($status) {
            $query->where('a.status = :status')->setParameter('status', $status);
        }

        $appointments = $query->getQuery()->getResult();
        return $this->json(['data' => array_map(fn(Appointment $a) => [
            'id' => $a->getId(),
            'client_name' => $a->getClient()?->getNomCommercial() ?? $a->getClient()?->getEmail(),
            'provider_name' => $a->getProvider()?->getNomCommercial() ?? $a->getProvider()?->getEmail(),
            'service' => $a->getService()?->getTitle(),
            'status' => $a->getStatus(),
            'appointment_date' => $a->getScheduledAt()->format('Y-m-d H:i:s'),
            'price' => $a->getBudget() ?? 0,
        ], $appointments)]);
    }

    #[Route('/reviews', methods: ['GET'])]
    public function listReviews(ReviewRepository $repo, Request $req): JsonResponse
    {
        $flagged = $req->query->getBoolean('flagged');
        $query = $repo->createQueryBuilder('r');

        if ($flagged) {
            $query->where('r.isFlagged = true');
        }

        $reviews = $query->getQuery()->getResult();
        return $this->json(['data' => array_map(fn(Review $r) => [
            'id' => $r->getId(),
            'reviewer' => $r->getReviewer()?->getEmail(),
            'rating' => $r->getRating(),
            'comment' => $r->getComment(),
            'is_flagged' => $r->isFlagged(),
        ], $reviews)]);
    }

    #[Route('/reviews/{id}', methods: ['DELETE'])]
    public function deleteReview(Review $review, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($review);
        $em->flush();
        return $this->json(['message' => 'Avis supprimé']);
    }

    #[Route('/stats/revenue', methods: ['GET'])]
    public function revenueStats(AppointmentRepository $repo): JsonResponse
    {
        $completed = $repo->findBy(['status' => 'completed']);
        $totalRevenue = array_sum(array_map(fn(Appointment $a) => $a->getBudget() ?? 0, $completed));
        $commission = $totalRevenue * 0.10; // 10% commission

        return $this->json([
            'total_revenue' => $totalRevenue,
            'commission' => $commission,
            'net_revenue' => $totalRevenue - $commission,
            'completed_appointments' => count($completed),
        ]);
    }
}
