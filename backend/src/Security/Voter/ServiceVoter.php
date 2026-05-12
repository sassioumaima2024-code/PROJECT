<?php
namespace App\Security\Voter;

use App\Entity\Service;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ServiceVoter extends Voter
{
    public const EDIT = 'SERVICE_EDIT';
    public const DELETE = 'SERVICE_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE])
            && $subject instanceof Service;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Service $service */
        $service = $subject;

        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        return $service->getProvider() === $user;
    }
}
