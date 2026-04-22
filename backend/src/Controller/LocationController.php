<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class LocationController extends AbstractController
{
    #[Route('/location/update', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function update(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();
        $user->setLatitude($data['latitude']);
        $user->setLongitude($data['longitude']);
        $em->flush();
        return $this->json(['message' => 'Position mise à jour']);
    }

    #[Route('/providers/nearby', methods: ['GET'])]
    public function nearby(Request $req, UserRepository $repo): JsonResponse
    {
        $lat    = $req->query->get('lat');
        $lng    = $req->query->get('lng');
        $radius = $req->query->get('radius', 10);

        $providers = $repo->findNearby($lat, $lng, $radius);
        return $this->json($providers);
    }
}