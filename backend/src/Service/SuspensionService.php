<?php
namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class SuspensionService
{
    public function __construct(
        private EntityManagerInterface $em,
        private MailerInterface $mailer
    ) {}

    public function checkSuspension(User $user): void
    {
        $count = $user->getBadRatingsCount();

        if ($count === 10 || $count === 15) {
            $this->sendWarningEmail($user, $count);
        }

        if ($count >= 20) {
            $user->setIsActive(false);
            $this->em->flush();
            $this->sendSuspensionEmail($user);
        }
    }

    private function sendWarningEmail(User $user, int $count): void
    {
        $email = (new Email())
            ->from('noreply@servicy.tn')
            ->to($user->getEmail())
            ->subject("⚠️ Avertissement SERVICY — $count mauvaises notes")
            ->text("Vous avez reçu $count mauvaises notes. Améliorez votre service pour éviter la suspension.");
        $this->mailer->send($email);
    }

    private function sendSuspensionEmail(User $user): void
    {
        $email = (new Email())
            ->from('noreply@servicy.tn')
            ->to($user->getEmail())
            ->subject('🚫 Compte SERVICY suspendu')
            ->text('Votre compte a été suspendu suite à 20 mauvaises évaluations.');
        $this->mailer->send($email);
    }
}