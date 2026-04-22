<?php
namespace App\Controller;

use App\Entity\Appointment;
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
        $appointments = $repo->findBy(['provider' => $this->getUser()]);
        return $this->json($appointments, 200, [], ['groups' => 'appointment:read']);
    }

    #[Route('/appointments/{id}/accept', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function accept(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        if ($appt->getStatus() !== Appointment::STATUS_PENDING) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }
        $appt->setStatus(Appointment::STATUS_CONFIRMED);
        $em->flush();
        return $this->json(['status' => $appt->getStatus()]);
    }
    // POST /api/appointments — client crée une demande de RDV
    #[Route('/appointments', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function create(
        Request $req,
        EntityManagerInterface $em,
        UserRepository $userRepo
    ): JsonResponse {
        $data = json_decode($req->getContent(), true);

        $provider = $userRepo->find($data['provider_id']);
        if (!$provider) {
            return $this->json(['error' => 'Prestataire introuvable'], 404);
        }

        $service = $em->getRepository(\App\Entity\Service::class)
                    ->find($data['service_id']);
        if (!$service) {
            return $this->json(['error' => 'Service introuvable'], 404);
        }

    $appt = new Appointment();
    $appt->setClient($this->getUser());
    $appt->setProvider($provider);
    $appt->setService($service);
    $appt->setScheduledAt(new \DateTime($data['scheduled_at']));
    $appt->setDescription($data['description'] ?? null);
    $appt->setBudget($data['budget'] ?? null);
    $appt->setStatus(Appointment::STATUS_PENDING);

    $em->persist($appt);
    $em->flush();

    return $this->json([
        'message' => 'Demande envoyée',
        'id'      => $appt->getId(),
        'status'  => $appt->getStatus(),
    ], 201);
    }
    #[Route('/appointments/{id}/refuse', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function refuse(Appointment $appt, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $appt->setStatus(Appointment::STATUS_CANCELLED);
        $appt->setRefusalReason($data['reason'] ?? null);
        $em->flush();
        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/start', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function start(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        $appt->setStatus(Appointment::STATUS_IN_PROGRESS);
        $em->flush();
        return $this->json(['status' => $appt->getStatus()]);
    }

    #[Route('/appointments/{id}/complete', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function complete(Appointment $appt, EntityManagerInterface $em): JsonResponse
    {
        $appt->setStatus(Appointment::STATUS_COMPLETED);
        $em->flush();
        return $this->json(['status' => $appt->getStatus()]);
    }
}