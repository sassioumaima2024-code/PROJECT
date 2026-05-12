<?php
namespace App\Controller;

use App\Entity\User;
use App\Entity\Appointment;
use App\Entity\Notification;
use App\Entity\Review;
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
            'address'        => $user->getAddress(),
            'isActive'       => $user->isActive(),
            'isAvailableNow' => $user->isAvailableNow(),
            'governorates'   => $user->getGovernorates(),
            'categories'     => $user->getCategories(),
            'profilePhoto'   => $user->getProfilePhoto(),
            'portfolio'      => $user->getPortfolio(),
            'documents'      => $user->getDocuments(),
            'isVerified'     => $user->isVerified(),
            'description'    => $user->getDescription(),
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
        if (isset($data['address']))        $user->setAddress($data['address']);
        if (isset($data['governorates']))   $user->setGovernorates($data['governorates']);
        if (isset($data['categories']))     $user->setCategories($data['categories']);
        if (isset($data['description']))    $user->setDescription($data['description']);

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
                'portfolio'      => $user->getPortfolio(),
                'documents'      => $user->getDocuments(),
                'isVerified'     => $user->isVerified(),
                'description'    => $user->getDescription(),
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

    #[Route('/provider/dashboard', methods: ['GET'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function dashboard(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $appointments = $em->getRepository(Appointment::class)->findBy(['provider' => $user]);
        $reviews = $em->getRepository(Review::class)->findBy(['provider' => $user]);

        $today = (new \DateTimeImmutable('today'))->format('Y-m-d');
        $month = (new \DateTimeImmutable('first day of this month'))->format('Y-m');
        $todayCount = 0;
        $monthCount = 0;
        $completedCount = 0;
        $pending = [];
        $upcoming = null;

        foreach ($appointments as $appointment) {
            $date = $appointment->getScheduledAt()->format('Y-m-d');
            if ($date === $today) {
                $todayCount++;
            }
            if ($appointment->getScheduledAt()->format('Y-m') === $month) {
                $monthCount++;
            }
            if ($appointment->getStatus() === Appointment::STATUS_COMPLETED) {
                $completedCount++;
            }
            if ($appointment->getStatus() === Appointment::STATUS_PENDING) {
                $pending[] = [
                    'id' => $appointment->getId(),
                    'description' => $appointment->getDescription(),
                    'scheduledAt' => $appointment->getScheduledAt()->format('Y-m-d H:i'),
                ];
            }
            if ($appointment->getScheduledAt() >= new \DateTime() && $appointment->getStatus() !== Appointment::STATUS_CANCELLED) {
                if ($upcoming === null || $appointment->getScheduledAt() < new \DateTime($upcoming['scheduledAt'])) {
                    $upcoming = [
                        'id' => $appointment->getId(),
                        'description' => $appointment->getDescription(),
                        'scheduledAt' => $appointment->getScheduledAt()->format('Y-m-d H:i'),
                        'status' => $appointment->getStatus(),
                    ];
                }
            }
        }

        $rating = count($reviews) > 0
            ? round(array_sum(array_map(fn(Review $r) => $r->getRating(), $reviews)) / count($reviews), 2)
            : null;
        $accepted = count(array_filter($appointments, fn(Appointment $a) => in_array($a->getStatus(), [
            Appointment::STATUS_CONFIRMED,
            Appointment::STATUS_IN_PROGRESS,
            Appointment::STATUS_COMPLETED,
        ], true)));

        return $this->json([
            'isAvailableNow' => $user->isAvailableNow(),
            'todayAppointments' => $todayCount,
            'monthAppointments' => $monthCount,
            'averageRating' => $rating,
            'pendingRequests' => array_slice($pending, 0, 5),
            'upcomingAppointment' => $upcoming,
            'completedAppointments' => $completedCount,
            'acceptanceRate' => count($appointments) > 0 ? round(($accepted / count($appointments)) * 100) : 0,
            'badRatingsCount' => $user->getBadRatingsCount(),
            'unreadNotifications' => $em->getRepository(Notification::class)->count([
                'user' => $user,
                'isRead' => false,
            ]),
        ]);
    }
}
