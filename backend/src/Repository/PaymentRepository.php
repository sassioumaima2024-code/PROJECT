<?php

namespace App\Repository;

use App\Entity\Payment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Payment>
 */
class PaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payment::class);
    }

    public function save(Payment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Payment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findByAppointment(int $appointmentId): ?Payment
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.appointment = :appointmentId')
            ->setParameter('appointmentId', $appointmentId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByStripePaymentIntent(string $paymentIntentId): ?Payment
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.stripePaymentIntentId = :paymentIntentId')
            ->setParameter('paymentIntentId', $paymentIntentId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
