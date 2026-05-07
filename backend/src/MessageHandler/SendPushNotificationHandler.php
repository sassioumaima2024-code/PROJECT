<?php
namespace App\MessageHandler;

use App\Message\SendPushNotification;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class SendPushNotificationHandler
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function __invoke(SendPushNotification $message): void
    {
        $user = $this->userRepository->find($message->getUserId());
        if (!$user) {
            return;
        }

        // Ici, intégrer Firebase FCM si configuré
        // Exemple: appel à l'API Firebase Cloud Messaging
        // Pour le moment, logger ou stocker dans la base

        // TODO: Implémenter l'envoi FCM
        // $firebaseService->send($user->getFcmToken(), [
        //     'title' => $message->getTitle(),
        //     'body' => $message->getBody(),
        //     'type' => $message->getType(),
        // ]);

        // Fallback: stocker dans la table Notification
        // (Peut être consulté depuis l'app mobile)
    }
}
