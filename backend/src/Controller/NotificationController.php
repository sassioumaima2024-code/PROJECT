<?php
namespace App\Controller;

use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class NotificationController extends AbstractController
{
    // GET /api/notifications — mes notifications
    #[Route('/notifications', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $notifs = $em->getRepository(Notification::class)->findBy(
            ['user' => $this->getUser()],
            ['createdAt' => 'DESC'],
            20
        );

        $data = array_map(fn($n) => [
            'id'        => $n->getId(),
            'title'     => $n->getTitle(),
            'body'      => $n->getBody(),
            'type'      => $n->getType(),
            'isRead'    => $n->isRead(),
            'createdAt' => $n->getCreatedAt()->format('Y-m-d H:i'),
        ], $notifs);

        return $this->json($data);
    }

    // PATCH /api/notifications/{id}/read — marquer comme lu
    #[Route('/notifications/{id}/read', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function markRead(Notification $notif, EntityManagerInterface $em): JsonResponse
    {
        $notif->setIsRead(true);
        $em->flush();
        return $this->json(['message' => 'Notification lue']);
    }

    // GET /api/notifications/unread-count
    #[Route('/notifications/unread-count', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function unreadCount(EntityManagerInterface $em): JsonResponse
    {
        $count = $em->getRepository(Notification::class)->count([
            'user'   => $this->getUser(),
            'isRead' => false,
        ]);
        return $this->json(['count' => $count]);
    }
}