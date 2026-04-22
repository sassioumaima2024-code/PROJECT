<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $req,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($req->getContent(), true);

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));
        $user->setRole($data['role'] ?? 'client');
        $user->setPhone($data['phone'] ?? null);
        $user->setNomCommercial($data['nom_commercial'] ?? null);
        $user->setGovernorates($data['gouvernorats'] ?? []);
        $user->setCategories($data['categories'] ?? []);

        // Rôles Symfony
        $roles = match($user->getRole()) {
            'prestataire' => ['ROLE_PRESTATAIRE'],
            'admin'       => ['ROLE_ADMIN'],
            default       => ['ROLE_CLIENT'],
        };
        $user->setRoles($roles);

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Compte créé avec succès', 'id' => $user->getId()], 201);
    }

    #[Route('/login', methods: ['POST'])]
    public function login(
        Request $req,
        UserRepository $ur,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwt
    ): JsonResponse {
        $data = json_decode($req->getContent(), true);
        $user = $ur->findOneBy(['email' => $data['email']]);

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], 401);
        }

        if (!$user->isActive()) {
            return $this->json(['error' => 'Compte suspendu'], 403);
        }

        return $this->json([
            'token' => $jwt->create($user),
            'user'  => [
                'id'    => $user->getId(),
                'email' => $user->getEmail(),
                'role'  => $user->getRole(),
                'nom'   => $user->getNomCommercial(),
            ]
        ]);
    }
}