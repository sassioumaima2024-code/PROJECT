<?php
namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function send(User $user, string $title, string $body, string $type): void
    {
        $notif = new Notification();
        $notif->setUser($user);
        $notif->setTitle($title);
        $notif->setBody($body);
        $notif->setType($type);
        $this->em->persist($notif);
        $this->em->flush();
    }

    public function notifyNewAppointment(User $provider, string $clientName, string $date): void
    {
        $this->send($provider,
            '📅 Nouvelle demande de RDV',
            "$clientName souhaite un RDV le $date",
            'new_appointment'
        );
    }

    public function notifyAppointmentAccepted(User $client, string $date): void
    {
        $this->send($client,
            '✅ RDV Confirmé',
            "Votre RDV du $date a été accepté",
            'accepted'
        );
    }

    public function notifyAppointmentRefused(User $client, string $reason): void
    {
        $this->send($client,
            '❌ RDV Refusé',
            "Votre RDV a été refusé. Motif : $reason",
            'refused'
        );
    }

    public function notifySuspension(User $provider): void
    {
        $this->send($provider,
            '🚫 Compte Suspendu',
            'Votre compte a été suspendu suite à 20 mauvaises évaluations.',
            'suspended'
        );
    }
}