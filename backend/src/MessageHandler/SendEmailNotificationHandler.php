<?php
namespace App\MessageHandler;

use App\Message\SendEmailNotification;
use App\Repository\UserRepository;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class SendEmailNotificationHandler
{
    public function __construct(
        private MailerInterface $mailer,
        private UserRepository $userRepository
    ) {}

    public function __invoke(SendEmailNotification $message): void
    {
        $user = $this->userRepository->find($message->getUserId());
        if (!$user) {
            return;
        }

        $data = $message->getData();
        $type = $message->getType();

        $email = (new TemplatedEmail())
            ->from('noreply@servicy.tn')
            ->to($user->getEmail())
            ->subject($data['subject'] ?? 'Notification SERVICY');

        // Sélection du template selon le type
        $templateMapping = [
            'warning_10' => 'emails/warning_10.html.twig',
            'warning_15' => 'emails/warning_15.html.twig',
            'suspended' => 'emails/suspension.html.twig',
            'appointment_accepted' => 'emails/appointment_accepted.html.twig',
            'appointment_refused' => 'emails/appointment_refused.html.twig',
        ];

        if (isset($templateMapping[$type])) {
            $email->htmlTemplate($templateMapping[$type])
                  ->context([
                      'user' => $user,
                      'data' => $data,
                  ]);
        } else {
            // Fallback si template non trouvé
            $email->text($data['body'] ?? 'Notification SERVICY');
        }

        $this->mailer->send($email);
    }
}
