<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Entity\Message;
use App\Entity\User;
use App\Repository\MessageRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/messages')]
class MessageController extends AbstractController
{
    private MessageRepository $messageRepository;
    private EntityManagerInterface $entityManager;
    private NotificationService $notificationService;

    public function __construct(
        MessageRepository $messageRepository,
        EntityManagerInterface $entityManager,
        NotificationService $notificationService
    ) {
        $this->messageRepository = $messageRepository;
        $this->entityManager = $entityManager;
        $this->notificationService = $notificationService;
    }

    #[Route('/conversations', name: 'message_conversations', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getConversations(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $conversations = $this->messageRepository->findConversations($user);
        
        $formattedConversations = array_map(function ($conversation) {
            return [
                'userId' => (int) $conversation['other_user_id'],
                'email' => $conversation['email'],
                'nomCommercial' => $conversation['nom_commercial'],
                'lastMessageAt' => $conversation['last_message_at'],
                'unreadCount' => (int) $conversation['unread_count'],
            ];
        }, $conversations);

        return $this->json($formattedConversations);
    }

    #[Route('/conversation/{userId}', name: 'message_conversation', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getConversation(User $otherUser, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $appointmentId = $request->query->get('appointment_id');
        $limit = min($request->query->getInt('limit', 50), 100);
        $offset = $request->query->getInt('offset', 0);

        $messages = $this->messageRepository->findConversation(
            $user, 
            $otherUser, 
            $appointmentId ? (int) $appointmentId : null,
            $limit,
            $offset
        );

        // Mark messages as read
        $this->messageRepository->markMessagesAsRead($user, $otherUser);

        $formattedMessages = array_map(function (Message $message) use ($user) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'attachments' => $message->getAttachments(),
                'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
                'readAt' => $message->getReadAt()?->format('Y-m-d H:i:s'),
                'status' => $message->getStatus(),
                'isFromMe' => $message->getSender()->getId() === $user->getId(),
                'appointmentId' => $message->getAppointment()?->getId(),
            ];
        }, $messages);

        return $this->json($formattedMessages);
    }

    #[Route('/appointment/{appointmentId}', name: 'messages_by_appointment', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getMessagesByAppointment(int $appointmentId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $messages = $this->messageRepository->findMessagesByAppointment($appointmentId);

        // Check if user is part of this appointment
        $hasAccess = false;
        foreach ($messages as $message) {
            if ($message->getSender()->getId() === $user->getId() || 
                $message->getRecipient()->getId() === $user->getId()) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $formattedMessages = array_map(function (Message $message) use ($user) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'attachments' => $message->getAttachments(),
                'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
                'readAt' => $message->getReadAt()?->format('Y-m-d H:i:s'),
                'status' => $message->getStatus(),
                'isFromMe' => $message->getSender()->getId() === $user->getId(),
                'senderId' => $message->getSender()->getId(),
                'senderName' => $message->getSender()->getNomCommercial() ?? $message->getSender()->getEmail(),
                'recipientId' => $message->getRecipient()->getId(),
                'recipientName' => $message->getRecipient()->getNomCommercial() ?? $message->getRecipient()->getEmail(),
            ];
        }, $messages);

        return $this->json($formattedMessages);
    }

    #[Route('/send', name: 'message_send', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function sendMessage(Request $request): JsonResponse
    {
        /** @var User $sender */
        $sender = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        $recipientId = $data['recipient_id'] ?? null;
        $content = $data['content'] ?? null;
        $appointmentId = $data['appointment_id'] ?? null;
        $attachments = $data['attachments'] ?? [];

        if (!$recipientId || !$content) {
            return $this->json(['error' => 'Missing recipient_id or content'], Response::HTTP_BAD_REQUEST);
        }

        $recipient = $this->entityManager->find(User::class, $recipientId);
        if (!$recipient) {
            return $this->json(['error' => 'Recipient not found'], Response::HTTP_NOT_FOUND);
        }

        $appointment = null;
        if ($appointmentId) {
            $appointment = $this->entityManager->find(Appointment::class, $appointmentId);
            if (!$appointment) {
                return $this->json(['error' => 'Appointment not found'], Response::HTTP_NOT_FOUND);
            }
        }

        $message = new Message();
        $message->setSender($sender);
        $message->setRecipient($recipient);
        $message->setContent($content);
        $message->setAttachments($attachments);
        $message->setAppointment($appointment);

        $this->messageRepository->save($message, true);

        // Send notification to recipient
        $this->notificationService->sendNewMessageNotification($recipient, $sender, $content);

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'attachments' => $message->getAttachments(),
            'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
            'status' => $message->getStatus(),
            'appointmentId' => $message->getAppointment()?->getId(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{messageId}/read', name: 'message_mark_read', methods: ['PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function markAsRead(int $messageId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $message = $this->messageRepository->find($messageId);
        if (!$message) {
            return $this->json(['error' => 'Message not found'], Response::HTTP_NOT_FOUND);
        }

        if ($message->getRecipient()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $message->markAsRead();
        $this->messageRepository->save($message, true);

        return $this->json([
            'id' => $message->getId(),
            'readAt' => $message->getReadAt()->format('Y-m-d H:i:s'),
            'status' => $message->getStatus(),
        ]);
    }

    #[Route('/unread', name: 'messages_unread', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUnreadMessages(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $messages = $this->messageRepository->findUnreadMessages($user);

        $formattedMessages = array_map(function (Message $message) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'attachments' => $message->getAttachments(),
                'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
                'senderId' => $message->getSender()->getId(),
                'senderName' => $message->getSender()->getNomCommercial() ?? $message->getSender()->getEmail(),
                'appointmentId' => $message->getAppointment()?->getId(),
            ];
        }, $messages);

        return $this->json($formattedMessages);
    }

    #[Route('/unread/count', name: 'messages_unread_count', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUnreadCount(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $count = $this->messageRepository->getUnreadCount($user);

        return $this->json(['count' => $count]);
    }

    #[Route('/search', name: 'messages_search', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function searchMessages(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $query = $request->query->get('q');
        if (!$query) {
            return $this->json(['error' => 'Search query required'], Response::HTTP_BAD_REQUEST);
        }

        $limit = min($request->query->getInt('limit', 20), 50);
        $messages = $this->messageRepository->searchMessages($user, $query, $limit);

        $formattedMessages = array_map(function (Message $message) use ($user) {
            return [
                'id' => $message->getId(),
                'content' => $message->getContent(),
                'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
                'senderId' => $message->getSender()->getId(),
                'senderName' => $message->getSender()->getNomCommercial() ?? $message->getSender()->getEmail(),
                'recipientId' => $message->getRecipient()->getId(),
                'recipientName' => $message->getRecipient()->getNomCommercial() ?? $message->getRecipient()->getEmail(),
                'appointmentId' => $message->getAppointment()?->getId(),
                'isFromMe' => $message->getSender()->getId() === $user->getId(),
            ];
        }, $messages);

        return $this->json($formattedMessages);
    }

    #[Route('/conversation/{userId}/delete', name: 'message_conversation_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteConversation(User $otherUser): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $deletedCount = $this->messageRepository->deleteMessages($user, $otherUser);

        return $this->json(['deletedCount' => $deletedCount]);
    }

    #[Route('/{messageId}', name: 'message_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteMessage(int $messageId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $message = $this->messageRepository->find($messageId);
        if (!$message) {
            return $this->json(['error' => 'Message not found'], Response::HTTP_NOT_FOUND);
        }

        if ($message->getSender()->getId() !== $user->getId() && 
            $message->getRecipient()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $message->setStatus(Message::STATUS_DELETED);
        $this->messageRepository->save($message, true);

        return $this->json(['id' => $message->getId(), 'status' => $message->getStatus()]);
    }

    #[Route('/upload-attachment', name: 'message_upload_attachment', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadAttachment(Request $request): JsonResponse
    {
        $uploadedFile = $request->files->get('file');
        if (!$uploadedFile) {
            return $this->json(['error' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        if (!in_array($uploadedFile->getMimeType(), $allowedTypes)) {
            return $this->json(['error' => 'File type not allowed'], Response::HTTP_BAD_REQUEST);
        }

        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($uploadedFile->getSize() > $maxSize) {
            return $this->json(['error' => 'File too large'], Response::HTTP_BAD_REQUEST);
        }

        // Generate unique filename
        $filename = uniqid() . '.' . $uploadedFile->guessExtension();
        $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/messages';
        
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }

        try {
            $uploadedFile->move($uploadsDir, $filename);
            
            return $this->json([
                'filename' => $filename,
                'originalName' => $uploadedFile->getClientOriginalName(),
                'size' => $uploadedFile->getSize(),
                'mimeType' => $uploadedFile->getMimeType(),
                'url' => '/uploads/messages/' . $filename,
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to upload file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
