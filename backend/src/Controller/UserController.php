<?php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class UserController extends AbstractController
{
    // GET /api/profile — mon profil
    #[Route('/profile', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id'             => $user->getId(),
            'email'          => $user->getEmail(),
            'role'           => $user->getRole(),
            'nomCommercial'  => $user->getNomCommercial(),
            'phone'          => $user->getPhone(),
            'isActive'       => $user->isActive(),
            'isAvailableNow' => $user->isAvailableNow(),
            'governorates'   => $user->getGovernorates(),
            'categories'     => $user->getCategories(),
            'profilePhoto'   => $user->getProfilePhoto(),
        ]);
    }

    // PUT /api/profile — modifier mon profil
    #[Route('/profile', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(Request $req, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($req->getContent(), true);
        
        if (!is_array($data)) {
            return $this->json(['error' => 'Données JSON invalides'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (isset($data['nom_commercial'])) $user->setNomCommercial($data['nom_commercial']);
        if (isset($data['phone']))          $user->setPhone($data['phone']);
        if (isset($data['governorates']))   $user->setGovernorates($data['governorates']);
        if (isset($data['categories']))     $user->setCategories($data['categories']);

        $em->persist($user);
        $em->flush();
        
        return $this->json([
            'message' => 'Profil mis à jour',
            'user' => [
                'id'             => $user->getId(),
                'email'          => $user->getEmail(),
                'role'           => $user->getRole(),
                'nomCommercial'  => $user->getNomCommercial(),
                'phone'          => $user->getPhone(),
                'isActive'       => $user->isActive(),
                'isAvailableNow' => $user->isAvailableNow(),
                'governorates'   => $user->getGovernorates(),
                'categories'     => $user->getCategories(),
                'profilePhoto'   => $user->getProfilePhoto(),
            ]
        ]);
    }

    // PATCH /api/provider/availability — toggle disponibilité
    #[Route('/provider/availability', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function toggleAvailability(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user->setIsAvailableNow(!$user->isAvailableNow());
        $em->persist($user);
        $em->flush();
        
        return $this->json(['isAvailableNow' => $user->isAvailableNow()]);
    }
}