<?php
namespace App\Controller;

use App\Entity\Appointment;
use App\Entity\Notification;
use App\Repository\AppointmentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class AppointmentController extends AbstractController
{
    #[Route('/provider/appointments', methods: ['GET'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function myAppointments(AppointmentRepository $repo): JsonResponse
    {
        $appointments = $repo->findBy(['provider' => $this->getUser()], ['scheduledAt' => 'ASC']);
        return $this->json(['data' => array_map(fn(Appointment $a) => $this->serializeAppointment($a), $appointments)]);
    }

    #[Route('/provider/appointments/calendar', methods: ['GET'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function calendar(AppointmentRepository $repo): JsonResponse
    {
        $appointments = $repo->findBy(['provider' => $this->getUser()]);
        return $this->json(['data' => array_map(fn(Appointment $a) => [
            'id' => $a->getId(),
            'date' => $a->getScheduledAt()->format('Y-m-d'),
            'status' => $a->getStatus(),
        ], $appointments)]);
    }

    #[Route('/appointments/{id}', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(Appointment $appt): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser() && $appt->getClient() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        return $this->json($this->serializeAppointment($appt));
    }

    #[Route('/appointments', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function create(Request $req, EntityManagerInterface $em, UserRepository $userRepo): JsonResponse
    {
        $data = json_decode($req->getContent(), true) ?? [];
        $provider = $userRepo->find($data['provider_id'] ?? null);
        $service = $em->getRepository(\App\Entity\Service::class)->find($data['service_id'] ?? null);

        if (!$provider) {
            return $this->json(['error' => 'Prestataire introuvable'], 404);
        }
        if (!$service) {
            return $this->json(['error' => 'Service introuvable'], 404);
        }

        $appt = new Appointment();
        $appt->setClient($this->getUser());
        $appt->setProvider($provider);
        $appt->setService($service);
        $appt->setScheduledAt(new \DateTime($data['scheduled_at'] ?? 'now'));
        $appt->setDescription($data['description'] ?? null);
        $appt->setBudget($data['budget'] ?? null);
        $appt->setPhotos($data['photos'] ?? []);
        $appt->setStatus(Appointment::STATUS_PENDING);

        $em->persist($appt);
        $this->createNotification($em, $provider, 'Nouvelle demande de RDV', 'Un client vous a envoye une demande.', 'new_appointment');
        $em->flush();

        return $this->json([
            'message' => 'Demande envoyee',
            'id' => $appt->getId(),
            'status' => $appt->getStatus(),
        ], 201);
    }

    #[Route('/appointments/{id}/accept', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function accept(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }
        if ($appt->getStatus() !== Appointment::STATUS_PENDING) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $appt->setStatus(Appointment::STATUS_CONFIRMED);
        $this->createNotification($em, $appt->getClient(), 'RDV accepte', 'Votre rendez-vous a ete accepte.', 'accepted');
        $em->flush();

        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/refuse', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function refuse(Appointment $appt, Request $req, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        $data = json_decode($req->getContent(), true) ?? [];
        $reason = $data['reason'] ?? 'Non disponible';
        $appt->setStatus(Appointment::STATUS_CANCELLED);
        $appt->setRefusalReason($reason);
        $this->createNotification($em, $appt->getClient(), 'RDV refuse', $reason, 'refused');
        $em->flush();

        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/alternative', methods: ['PATCH', 'POST'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function alternative(Appointment $appt, Request $req, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        $data = json_decode($req->getContent(), true) ?? [];
        if (empty($data['scheduled_at'])) {
            return $this->json(['error' => 'scheduled_at requis'], 400);
        }

        $appt->setScheduledAt(new \DateTime($data['scheduled_at']));
        $appt->setStatus(Appointment::STATUS_PENDING);
        $this->createNotification($em, $appt->getClient(), 'Nouveau creneau propose', 'Le prestataire propose un autre horaire.', 'alternative');
        $em->flush();

        return $this->json($this->serializeAppointment($appt));
    }

    #[Route('/appointments/{id}/cancel', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function cancel(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser() && $appt->getClient() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        $appt->setStatus(Appointment::STATUS_CANCELLED);
        $em->flush();

        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/start', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function start(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        $appt->setStatus(Appointment::STATUS_IN_PROGRESS);
        $em->flush();

        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/complete', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function complete(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Acces refuse'], 403);
        }

        $appt->setStatus(Appointment::STATUS_COMPLETED);
        $em->flush();

        return $this->json(['status' => $appt->getStatus()]);
    }

    private function serializeAppointment(Appointment $appt): array
    {
        return [
            'id' => $appt->getId(),
            'status' => $appt->getStatus(),
            'scheduledAt' => $appt->getScheduledAt()->format('Y-m-d H:i:s'),
            'description' => $appt->getDescription(),
            'budget' => $appt->getBudget(),
            'photos' => $appt->getPhotos(),
            'refusalReason' => $appt->getRefusalReason(),
            'client' => [
                'id' => $appt->getClient()->getId(),
                'name' => $appt->getClient()->getNomCommercial() ?? $appt->getClient()->getEmail(),
                'phone' => $appt->getClient()->getPhone(),
            ],
            'service' => [
                'id' => $appt->getService()->getId(),
                'title' => $appt->getService()->getTitle(),
            ],
        ];
    }

    private function createNotification(EntityManagerInterface $em, $user, string $title, string $body, string $type): void
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setTitle($title);
        $notification->setBody($body);
        $notification->setType($type);
        $em->persist($notification);
    }
}
