<?php
namespace App\Security\Voter;

use App\Entity\Appointment;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class AppointmentVoter extends Voter
{
    public const VIEW = 'APPOINTMENT_VIEW';
    public const EDIT = 'APPOINTMENT_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT])
            && $subject instanceof Appointment;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Appointment $appointment */
        $appointment = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($appointment, $user),
            self::EDIT => $this->canEdit($appointment, $user),
            default => false,
        };
    }

    private function canView(Appointment $appointment, User $user): bool
    {
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        return $appointment->getClient() === $user || $appointment->getProvider() === $user;
    }

    private function canEdit(Appointment $appointment, User $user): bool
    {
        return $appointment->getClient() === $user || $appointment->getProvider() === $user;
    }
}
