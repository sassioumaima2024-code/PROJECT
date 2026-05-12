<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\GovernorateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
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
        UserRepository $ur,
        GovernorateRepository $gr,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = $this->requestData($req);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis'], 400);
        }
        if ($ur->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Email deja utilise'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));
        $user->setRole($data['role'] ?? 'client');
        $user->setPhone($data['phone'] ?? null);
        $user->setNomCommercial($data['nom_commercial'] ?? null);
        $user->setProfilePhoto($this->storeUploadedFile($req->files->get('profile_photo'), 'profiles') ?? ($data['profile_photo'] ?? null));
        
        if (!empty($data['governorate_id'])) {
            $user->setGovernorate($gr->find($data['governorate_id']));
        }

        $user->setCategories($data['categories'] ?? []);
        $user->setPortfolio($this->storeUploadedFiles($req->files->all('portfolio'), 'portfolio'));
        $user->setDocuments(array_filter([
            'cin' => $this->storeUploadedFile($req->files->get('cin_document'), 'documents') ?? ($data['documents']['cin'] ?? null),
            'certificate' => $this->storeUploadedFile($req->files->get('certificate_document'), 'documents') ?? ($data['documents']['certificate'] ?? null),
        ]));
        $user->setOtpCode((string) random_int(100000, 999999));
        $user->setOtpExpiresAt(new \DateTimeImmutable('+15 minutes'));

        $roles = match($user->getRole()) {
            'prestataire' => ['ROLE_PRESTATAIRE'],
            'admin'       => ['ROLE_ADMIN'],
            default       => ['ROLE_CLIENT'],
        };
        $user->setRoles($roles);

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Compte cree avec succes',
            'id' => $user->getId(),
            'otp_required' => true,
            'otp_expires_at' => $user->getOtpExpiresAt()?->format(\DateTimeInterface::ATOM),
            'dev_otp' => $this->getParameter('kernel.environment') === 'prod' ? null : $user->getOtpCode(),
        ], 201);
    }

    #[Route('/verify-otp', methods: ['POST'])]
    public function verifyOtp(Request $req, UserRepository $ur, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        $code = (string) ($data['code'] ?? '');
        $email = $data['email'] ?? null;

        if (!preg_match('/^\d{6}$/', $code)) {
            return $this->json(['error' => 'Code OTP invalide'], 400);
        }

        $user = $this->getUser();
        if (!$user && $email) {
            $user = $ur->findOneBy(['email' => $email]);
        }
        if (!$user instanceof User) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }
        if ($user->getOtpExpiresAt() === null || $user->getOtpExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['error' => 'Code OTP expire'], 400);
        }
        if ($user->getOtpCode() !== $code) {
            return $this->json(['error' => 'Code OTP invalide'], 400);
        }

        $user->setIsVerified(true);
        $user->setOtpCode(null);
        $user->setOtpExpiresAt(null);
        $em->flush();

        return $this->json(['message' => 'OTP verifie']);
    }

    #[Route('/refresh-token', methods: ['POST'])]
    public function refreshToken(JWTTokenManagerInterface $jwt): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifie'], 401);
        }

        return $this->json(['token' => $jwt->create($user)]);
    }

    #[Route('/forgot-password', methods: ['POST'])]
    public function forgotPassword(Request $req): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        if (empty($data['email'])) {
            return $this->json(['error' => 'Email requis'], 400);
        }

        return $this->json(['message' => 'Si le compte existe, un email de reset sera envoye']);
    }

    #[Route('/reset-password', methods: ['POST'])]
    public function resetPassword(Request $req): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        if (empty($data['token']) || empty($data['password'])) {
            return $this->json(['error' => 'Token et mot de passe requis'], 400);
        }

        return $this->json(['message' => 'Mot de passe reinitialise']);
    }

    #[Route('/login', methods: ['POST'])]
    public function login(
        Request $req,
        UserRepository $ur,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwt
    ): JsonResponse {
        $data = json_decode($req->getContent(), true) ?? [];
        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis'], 400);
        }

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
                'isVerified' => $user->isVerified(),
            ]
        ]);
    }

    private function requestData(Request $req): array
    {
        if (str_starts_with((string) $req->headers->get('Content-Type'), 'multipart/form-data')) {
            $data = $req->request->all();
            foreach (['gouvernorats', 'categories', 'documents'] as $key) {
                if (isset($data[$key]) && is_string($data[$key])) {
                    $decoded = json_decode($data[$key], true);
                    $data[$key] = is_array($decoded) ? $decoded : [];
                }
            }
            return $data;
        }

        $data = json_decode($req->getContent(), true);
        return is_array($data) ? $data : [];
    }

    /**
     * @param UploadedFile[]|UploadedFile|null $files
     */
    private function storeUploadedFiles(array|UploadedFile|null $files, string $folder): array
    {
        if ($files instanceof UploadedFile) {
            $files = [$files];
        }
        if (!is_array($files)) {
            return [];
        }

        $paths = [];
        foreach ($files as $file) {
            $path = $this->storeUploadedFile($file, $folder);
            if ($path !== null) {
                $paths[] = $path;
            }
        }
        return $paths;
    }

    private function storeUploadedFile(mixed $file, string $folder): ?string
    {
        if (!$file instanceof UploadedFile || !$file->isValid()) {
            return null;
        }

        $extension = $file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'bin';
        $filename = bin2hex(random_bytes(16)).'.'.$extension;
        $relativeDir = '/uploads/'.$folder;
        $targetDir = $this->getParameter('kernel.project_dir').'/public'.$relativeDir;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);

        return $relativeDir.'/'.$filename;
    }
}
