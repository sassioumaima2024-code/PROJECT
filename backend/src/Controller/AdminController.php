<?php
namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\AppointmentRepository;
use App\Repository\ServiceRepository;
use App\Repository\CategoryRepository;
use App\Repository\ReviewRepository;
use App\Entity\Category;
use App\Entity\User;
use App\Entity\Service;
use App\Entity\Appointment;
use App\Entity\Review;
use App\Entity\Governorate;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;


#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    // GET /api/admin/users — liste tous les utilisateurs
    #[Route('/users', methods: ['GET'])]
    public function getUsers(UserRepository $repo): JsonResponse
    {
        $users = $repo->findAll();
        $data = array_map(function($user) {
            return [
                'id'        => $user->getId(),
                'name'      => $user->getNomCommercial(),
                'email'     => $user->getEmail(),
                'role'      => $user->getRole(),
                'phone'     => $user->getPhone(),
                'is_active' => $user->isActive(),
            ];
        }, $users);

        return $this->json($data);
    }

    // PATCH /api/admin/users/{id}/toggle — activer/suspendre un utilisateur
    #[Route('/users/{id}/toggle', methods: ['PATCH'])]
    public function toggleUser(int $id, UserRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $repo->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $user->setIsActive(!$user->isActive());
        $em->flush();

        return $this->json([
            'id'        => $user->getId(),
            'is_active' => $user->isActive(),
        ]);
    }
    // GET /api/admin/services — liste tous les services
#[Route('/services', methods: ['GET'])]
public function getServices(ServiceRepository $repo): JsonResponse
{
    $services = $repo->findAll();
    $data = array_map(function($service) {
        $categoryData = null;
        try {
            $cat = $service->getCategory();
            if ($cat) {
                $categoryData = [
                    'id' => $cat->getId(),
                    'name' => $cat->getName()
                ];
            }
        } catch (EntityNotFoundException $e) {
            $categoryData = ['id' => 0, 'name' => 'Catégorie supprimée'];
        }

        $providerData = null;
        $provider = $service->getProvider();
        if ($provider) {
            $providerData = [
                'id' => $provider->getId(),
                'name' => $provider->getNomCommercial() ?? $provider->getEmail()
            ];
        }

        return [
            'id'        => $service->getId(),
            'title'     => $service->getTitle(),
            'category'  => $categoryData,
            'provider'  => $providerData,
            'price_min' => $service->getPriceMin(),
            'price_max' => $service->getPriceMax(),
            'is_active' => $service->isActive(),
            'governorates' => $service->getGovernorates(),
        ];
    }, $services);

    return $this->json($data);
}

// GET /api/admin/services/{id} — détail d'un service
#[Route('/services/{id}', methods: ['GET'])]
public function getService(int $id, ServiceRepository $repo): JsonResponse
{
    $service = $repo->find($id);
    if (!$service) {
        return $this->json(['error' => 'Service introuvable'], 404);
    }

    $categoryData = null;
    try {
        $cat = $service->getCategory();
        if ($cat) {
            $categoryData = ['id' => $cat->getId(), 'name' => $cat->getName()];
        }
    } catch (EntityNotFoundException $e) {
        $categoryData = ['id' => 0, 'name' => 'Catégorie supprimée'];
    }

    $providerData = null;
    $provider = $service->getProvider();
    if ($provider) {
        $providerData = [
            'id' => $provider->getId(),
            'email' => $provider->getEmail(),
            'name' => $provider->getNomCommercial()
        ];
    }

    $data = [
        'id'        => $service->getId(),
        'title'     => $service->getTitle(),
        'description' => $service->getDescription(),
        'experience'=> $service->getExperience(),
        'category'  => $categoryData,
        'provider'  => $providerData,
        'price_min' => $service->getPriceMin(),
        'price_max' => $service->getPriceMax(),
        'is_active' => $service->isActive(),
        'governorates' => $service->getGovernorates(),
        'photos'    => $service->getPhotos(),
        'created_at'=> $service->getCreatedAt()?->format('Y-m-d H:i:s'),
    ];

    return $this->json($data);
}

    // GET /api/admin/appointments — liste toutes les réservations
    #[Route('/appointments', methods: ['GET'])]
    public function getAppointments(AppointmentRepository $repo): JsonResponse
    {
        $appointments = $repo->findAll();
        $data = array_map(function($appt) {
            return [
                'id'          => $appt->getId(),
                'status'      => $appt->getStatus(),
                'description' => $appt->getDescription(),
                'scheduled_at'=> $appt->getScheduledAt()?->format('Y-m-d'),
                'client'      => $appt->getClient()?->getNomCommercial() ?? $appt->getClient()?->getEmail(),
                'provider'    => $appt->getProvider()?->getNomCommercial() ?? $appt->getProvider()?->getEmail(),
            ];
        }, $appointments);

        return $this->json($data);
    }

    // GET /api/admin/appointments/{id} — détail d'un rendez-vous
    #[Route('/appointments/{id}', methods: ['GET'])]
    public function getAppointment(int $id, AppointmentRepository $repo): JsonResponse
    {
        $appt = $repo->find($id);
        if (!$appt) return $this->json(['error' => 'Rendez-vous introuvable'], 404);

        return $this->json([
            'id'          => $appt->getId(),
            'status'      => $appt->getStatus(),
            'description' => $appt->getDescription(),
            'scheduled_at'=> $appt->getScheduledAt()?->format('Y-m-d H:i:s'),
            'client'      => [
                'id' => $appt->getClient()?->getId(),
                'name' => $appt->getClient()?->getNomCommercial() ?? $appt->getClient()?->getEmail(),
                'email' => $appt->getClient()?->getEmail(),
                'phone' => $appt->getClient()?->getPhone(),
            ],
            'provider'    => [
                'id' => $appt->getProvider()?->getId(),
                'name' => $appt->getProvider()?->getNomCommercial() ?? $appt->getProvider()?->getEmail(),
                'email' => $appt->getProvider()?->getEmail(),
                'phone' => $appt->getProvider()?->getPhone(),
            ],
            'service'     => [
                'id' => $appt->getService()?->getId(),
                'title' => $appt->getService()?->getTitle(),
            ],
            'created_at'  => $appt->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    // GET /api/admin/dashboard/stats — KPIs globaux
    #[Route('/dashboard/stats', methods: ['GET'])]
    public function getStats(
        UserRepository $ur,
        ServiceRepository $sr,
        AppointmentRepository $ar
    ): JsonResponse {
        $latestProviders = $ur->findBy(['role' => 'prestataire'], ['id' => 'DESC'], 4);
        $providersData = array_map(function($p) {
            return [
                'name' => $p->getNomCommercial() ?? $p->getEmail(),
                'email' => $p->getEmail(),
                'city' => $p->getGovernorate()?->getNameFr() ?? 'N/A'
            ];
        }, $latestProviders);

        $alerts = [
            [
                'type' => 'suspension',
                'title' => 'Seuil de suspension',
                'score' => '18/20',
                'description' => 'Le compte de Mohamed R. nécessite une attention immédiate suite à plusieurs avis négatifs.',
                'target_id' => 12
            ],
            [
                'type' => 'verification',
                'title' => 'Vérification requise',
                'score' => 'Nouveau',
                'description' => 'Un nouveau prestataire (Amir S.) a soumis des documents incomplets.',
                'target_id' => 15
            ]
        ];

        return $this->json([
            'users_count'       => $ur->count([]),
            'providers_count'   => $ur->count(['role' => 'prestataire']),
            'appointments_count' => $ar->count([]),
            'total_revenue'     => number_format($ar->count(['status' => 'completed']) * 75.5, 2, '.', ''), 
            'latest_activity'   => $providersData,
            'alerts'            => $alerts
        ]);
    }

    // GET /api/admin/categories — Liste les catégories
    #[Route('/categories', methods: ['GET'])]
    public function getCategories(CategoryRepository $repo): JsonResponse
    {
        $categories = $repo->findAll();
        $data = array_map(function($cat) {
            return [
                'id' => $cat->getId(),
                'name' => $cat->getName(),
                'description' => $cat->getDescription(),
                'icon' => $cat->getIcon(),
                'is_active' => $cat->isActive()
            ];
        }, $categories);
        
        return $this->json($data);
    }

    // POST /api/admin/categories — Créer une catégorie
    #[Route('/categories', methods: ['POST'])]
    public function createCategory(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $cat = new Category();
        $cat->setName($data['name']);
        $cat->setDescription($data['description'] ?? null);
        $cat->setIcon($data['icon'] ?? null);
        
        $em->persist($cat);
        $em->flush();
        
        return $this->json(['message' => 'Catégorie créée', 'id' => $cat->getId()]);
    }

    // DELETE /api/admin/categories/{id} — Supprimer une catégorie
    #[Route('/categories/{id}', methods: ['DELETE'])]
    public function deleteCategory(int $id, CategoryRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $cat = $repo->find($id);
        if (!$cat) return $this->json(['error' => 'Catégorie introuvable'], 404);
        
        $em->remove($cat);
        $em->flush();
        
        return $this->json(['message' => 'Catégorie supprimée']);
    }

    // GET /api/admin/reviews — Liste tous les avis
    #[Route('/reviews', methods: ['GET'])]
    public function getReviews(ReviewRepository $repo): JsonResponse
    {
        $reviews = $repo->findAll();
        $data = array_map(function($review) {
            return [
                'id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'client' => $review->getClient()?->getNomCommercial() ?? $review->getClient()?->getEmail(),
                'provider' => $review->getProvider()?->getNomCommercial() ?? $review->getProvider()?->getEmail(),
            ];
        }, $reviews);
        return $this->json($data);
    }

    // DELETE /api/admin/reviews/{id} — Supprimer un avis
    #[Route('/reviews/{id}', methods: ['DELETE'])]
    public function deleteReview(int $id, ReviewRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $review = $repo->find($id);
        if (!$review) return $this->json(['error' => 'Avis introuvable'], 404);
        
        $em->remove($review);
        $em->flush();
        
        return $this->json(['message' => 'Avis supprimé']);
    }

    // GET /api/admin/governorates — Liste tous les gouvernorats
    #[Route('/governorates', methods: ['GET'])]
    public function getGovernorates(EntityManagerInterface $em): JsonResponse
    {
        $govs = $em->getRepository(Governorate::class)->findAll();
        $data = array_map(function($gov) {
            return [
                'id' => $gov->getId(),
                'name_fr' => $gov->getNameFr(),
                'name_ar' => $gov->getNameAr(),
                'code' => $gov->getCode()
            ];
        }, $govs);
        return $this->json($data);
    }
}
