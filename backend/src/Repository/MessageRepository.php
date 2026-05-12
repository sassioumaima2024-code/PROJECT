<?php

namespace App\Repository;

use App\Entity\Message;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function save(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findConversation(User $user1, User $user2, ?int $appointmentId = null, int $limit = 50, int $offset = 0): array
    {
        $qb = $this->createQueryBuilder('m')
            ->where('(m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1)')
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if ($appointmentId !== null) {
            $qb->andWhere('m.appointment = :appointmentId')
               ->setParameter('appointmentId', $appointmentId);
        }

        return $qb->getQuery()->getResult();
    }

    public function findUnreadMessages(User $recipient): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.recipient = :recipient')
            ->andWhere('m.readAt IS NULL')
            ->andWhere('m.status != :deleted')
            ->setParameter('recipient', $recipient)
            ->setParameter('deleted', Message::STATUS_DELETED)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findConversations(User $user): array
    {
        $conn = $this->getEntityManager()->getConnection();
        
        $sql = '
            SELECT DISTINCT 
                CASE 
                    WHEN m.sender_id = :userId THEN m.recipient_id 
                    ELSE m.sender_id 
                END as other_user_id,
                u.email,
                u.nom_commercial,
                MAX(m.created_at) as last_message_at,
                COUNT(CASE WHEN m.recipient_id = :userId AND m.read_at IS NULL THEN 1 END) as unread_count
            FROM message m
            JOIN users u ON (
                CASE 
                    WHEN m.sender_id = :userId THEN m.recipient_id 
                    ELSE m.sender_id 
                END = u.id
            )
            WHERE (m.sender_id = :userId OR m.recipient_id = :userId)
            AND m.status != :deleted
            GROUP BY other_user_id, u.email, u.nom_commercial
            ORDER BY last_message_at DESC
        ';

        $stmt = $conn->executeQuery($sql, [
            'userId' => $user->getId(),
            'deleted' => Message::STATUS_DELETED,
        ]);

        return $stmt->fetchAllAssociative();
    }

    public function findMessagesByAppointment(int $appointmentId): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.appointment = :appointmentId')
            ->andWhere('m.status != :deleted')
            ->setParameter('appointmentId', $appointmentId)
            ->setParameter('deleted', Message::STATUS_DELETED)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function markMessagesAsRead(User $recipient, ?User $sender = null): int
    {
        $qb = $this->createQueryBuilder('m')
            ->update()
            ->set('m.readAt', ':now')
            ->set('m.status', ':readStatus')
            ->where('m.recipient = :recipient')
            ->setParameter('recipient', $recipient)
            ->setParameter('now', new \DateTimeImmutable())
            ->setParameter('readStatus', Message::STATUS_READ);

        if ($sender !== null) {
            $qb->andWhere('m.sender = :sender')
               ->setParameter('sender', $sender);
        }

        return $qb->getQuery()->executeStatement();
    }

    public function deleteMessages(User $user, ?User $otherUser = null): int
    {
        $qb = $this->createQueryBuilder('m')
            ->update()
            ->set('m.status', ':deleted')
            ->where('(m.sender = :user OR m.recipient = :user)')
            ->setParameter('user', $user)
            ->setParameter('deleted', Message::STATUS_DELETED);

        if ($otherUser !== null) {
            $qb->andWhere('(m.sender = :otherUser OR m.recipient = :otherUser)')
               ->setParameter('otherUser', $otherUser);
        }

        return $qb->getQuery()->executeStatement();
    }

    public function getMessageCount(User $user): int
    {
        return (int) $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('(m.sender = :user OR m.recipient = :user)')
            ->andWhere('m.status != :deleted')
            ->setParameter('user', $user)
            ->setParameter('deleted', Message::STATUS_DELETED)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getUnreadCount(User $user): int
    {
        return (int) $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.recipient = :user')
            ->andWhere('m.readAt IS NULL')
            ->andWhere('m.status != :deleted')
            ->setParameter('user', $user)
            ->setParameter('deleted', Message::STATUS_DELETED)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function searchMessages(User $user, string $query, int $limit = 20): array
    {
        return $this->createQueryBuilder('m')
            ->where('(m.sender = :user OR m.recipient = :user)')
            ->andWhere('m.content LIKE :query')
            ->andWhere('m.status != :deleted')
            ->setParameter('user', $user)
            ->setParameter('query', '%' . $query . '%')
            ->setParameter('deleted', Message::STATUS_DELETED)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
