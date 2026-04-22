<?php
namespace App\Repository;

use App\Entity\Service;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ServiceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Service::class);
    }

    public function findWithFilters(array $filters): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.isActive = true');

        if (!empty($filters['category'])) {
            $qb->andWhere('s.category = :category')
               ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['price_min'])) {
            $qb->andWhere('s.priceMin >= :priceMin')
               ->setParameter('priceMin', $filters['price_min']);
        }

        if (!empty($filters['price_max'])) {
            $qb->andWhere('s.priceMax <= :priceMax')
               ->setParameter('priceMax', $filters['price_max']);
        }

        if (!empty($filters['rating'])) {
            $qb->andWhere('s.averageRating >= :rating')
               ->setParameter('rating', $filters['rating']);
        }

        return $qb->orderBy('s.averageRating', 'DESC')
                  ->setMaxResults(20)
                  ->getQuery()
                  ->getResult();
    }
}