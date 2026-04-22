<?php
namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findNearby(float $lat, float $lng, float $radius = 10): array
    {
        return $this->getEntityManager()->createNativeQuery("
            SELECT *, (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(latitude))
                    * cos(radians(longitude) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(latitude))
                )
            ) AS distance
            FROM user
            WHERE role = 'prestataire'
              AND is_active = 1
              AND is_available_now = 1
              AND latitude IS NOT NULL
            HAVING distance < :radius
            ORDER BY distance ASC
            LIMIT 20
        ", new \Doctrine\ORM\Query\ResultSetMapping())
        ->setParameter('lat', $lat)
        ->setParameter('lng', $lng)
        ->setParameter('radius', $radius)
        ->getResult();
    }
}