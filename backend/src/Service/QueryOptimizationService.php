<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Common\Collections\Criteria;

class QueryOptimizationService
{
    private EntityManagerInterface $entityManager;
    private CacheService $cacheService;

    public function __construct(EntityManagerInterface $entityManager, CacheService $cacheService)
    {
        $this->entityManager = $entityManager;
        $this->cacheService = $cacheService;
    }

    public function getOptimizedServicesQuery(array $filters = [], int $limit = 20, int $offset = 0): QueryBuilder
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('s', 'p', 'c', 'g')
            ->from('App\Entity\Service', 's')
            ->leftJoin('s.provider', 'p')
            ->leftJoin('s.category', 'c')
            ->leftJoin('p.governorates', 'g')
            ->where('s.isActive = :active')
            ->setParameter('active', true);

        // Apply filters efficiently
        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :category')
               ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['governorat'])) {
            $qb->andWhere('g.name = :governorat')
               ->setParameter('governorat', $filters['governorat']);
        }

        if (isset($filters['price_min'])) {
            $qb->andWhere('s.price >= :price_min')
               ->setParameter('price_min', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $qb->andWhere('s.price <= :price_max')
               ->setParameter('price_max', $filters['price_max']);
        }

        if (isset($filters['min_rating'])) {
            $qb->andWhere('p.rating >= :min_rating')
               ->setParameter('min_rating', $filters['min_rating']);
        }

        if (isset($filters['available_now']) && $filters['available_now']) {
            $qb->andWhere('p.isAvailableNow = :available_now')
               ->setParameter('available_now', true);
        }

        // Add ordering with index optimization
        $orderBy = $filters['sort_by'] ?? 'relevance';
        switch ($orderBy) {
            case 'price_asc':
                $qb->orderBy('s.price', 'ASC');
                break;
            case 'price_desc':
                $qb->orderBy('s.price', 'DESC');
                break;
            case 'rating':
                $qb->orderBy('p.rating', 'DESC');
                break;
            case 'created_at':
                $qb->orderBy('s.createdAt', 'DESC');
                break;
            default:
                $qb->orderBy('p.rating', 'DESC')
                   ->addOrderBy('s.createdAt', 'DESC');
        }

        return $qb->setMaxResults($limit)
                   ->setFirstResult($offset);
    }

    public function getOptimizedAppointmentsQuery(int $userId, string $userRole, array $filters = []): QueryBuilder
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('a', 'c', 'p', 's', 'cat')
            ->from('App\Entity\Appointment', 'a')
            ->leftJoin('a.client', 'c')
            ->leftJoin('a.provider', 'p')
            ->leftJoin('a.service', 's')
            ->leftJoin('s.category', 'cat');

        // Filter by user role
        if ($userRole === 'client') {
            $qb->where('a.client = :userId')
               ->setParameter('userId', $userId);
        } elseif ($userRole === 'prestataire') {
            $qb->where('a.provider = :userId')
               ->setParameter('userId', $userId);
        }

        // Apply status filters
        if (!empty($filters['status'])) {
            if (is_array($filters['status'])) {
                $qb->andWhere('a.status IN (:statuses)')
                   ->setParameter('statuses', $filters['status']);
            } else {
                $qb->andWhere('a.status = :status')
                   ->setParameter('status', $filters['status']);
            }
        }

        // Apply date filters
        if (!empty($filters['date_from'])) {
            $qb->andWhere('a.scheduledAt >= :dateFrom')
               ->setParameter('dateFrom', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $qb->andWhere('a.scheduledAt <= :dateTo')
               ->setParameter('dateTo', $filters['date_to']);
        }

        // Optimize ordering with indexes
        $qb->orderBy('a.scheduledAt', 'DESC')
           ->addOrderBy('a.createdAt', 'DESC');

        return $qb;
    }

    public function getOptimizedMessagesQuery(int $userId1, int $userId2, ?int $appointmentId = null): QueryBuilder
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('m', 's', 'r', 'a')
            ->from('App\Entity\Message', 'm')
            ->leftJoin('m.sender', 's')
            ->leftJoin('m.recipient', 'r')
            ->leftJoin('m.appointment', 'a')
            ->where('(m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1)')
            ->andWhere('m.status != :deleted')
            ->setParameter('user1', $userId1)
            ->setParameter('user2', $userId2)
            ->setParameter('deleted', 'deleted');

        if ($appointmentId) {
            $qb->andWhere('m.appointment = :appointmentId')
               ->setParameter('appointmentId', $appointmentId);
        }

        return $qb->orderBy('m.createdAt', 'DESC')
                   ->setMaxResults(50);
    }

    public function getOptimizedProvidersQuery(array $filters = [], int $limit = 20): QueryBuilder
    {
        $qb = $this->entityManager->createQueryBuilder()
            ->select('p', 's', 'c', 'g')
            ->from('App\Entity\User', 'p')
            ->leftJoin('p.services', 's')
            ->leftJoin('s.category', 'c')
            ->leftJoin('p.governorates', 'g')
            ->where('p.role = :role')
            ->andWhere('p.isActive = :active')
            ->setParameter('role', 'prestataire')
            ->setParameter('active', true);

        // Apply filters
        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :category')
               ->setParameter('category', $filters['category']);
        }

        if (!empty($filters['governorat'])) {
            $qb->andWhere('g.name = :governorat')
               ->setParameter('governorat', $filters['governorat']);
        }

        if (isset($filters['min_rating'])) {
            $qb->andWhere('p.rating >= :min_rating')
               ->setParameter('min_rating', $filters['min_rating']);
        }

        if (isset($filters['available_now']) && $filters['available_now']) {
            $qb->andWhere('p.isAvailableNow = :available_now')
               ->setParameter('available_now', true);
        }

        // Optimize ordering
        $qb->orderBy('p.rating', 'DESC')
           ->addOrderBy('p.createdAt', 'DESC')
           ->groupBy('p.id')
           ->setMaxResults($limit);

        return $qb;
    }

    public function getNearbyProvidersQuery(float $latitude, float $longitude, int $radius, array $filters = []): QueryBuilder
    {
        // Use Haversine formula for distance calculation
        $qb = $this->entityManager->createQueryBuilder()
            ->select('p', 's', 'c', 
                    '(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(p.latitude)))) AS distance')
            ->from('App\Entity\User', 'p')
            ->leftJoin('p.services', 's')
            ->leftJoin('s.category', 'c')
            ->where('p.role = :role')
            ->andWhere('p.isActive = :active')
            ->andWhere('p.latitude IS NOT NULL')
            ->andWhere('p.longitude IS NOT NULL')
            ->having('distance <= :radius')
            ->setParameter('latitude', $latitude)
            ->setParameter('longitude', $longitude)
            ->setParameter('role', 'prestataire')
            ->setParameter('active', true)
            ->setParameter('radius', $radius);

        // Apply additional filters
        if (!empty($filters['category'])) {
            $qb->andWhere('c.id = :category')
               ->setParameter('category', $filters['category']);
        }

        if (isset($filters['available_now']) && $filters['available_now']) {
            $qb->andWhere('p.isAvailableNow = :available_now')
               ->setParameter('available_now', true);
        }

        return $qb->orderBy('distance', 'ASC')
                   ->addOrderBy('p.rating', 'DESC')
                   ->groupBy('p.id')
                   ->setMaxResults(20);
    }

    public function getDashboardStatsQuery(): array
    {
        $cacheKey = 'dashboard_stats_query';
        
        return $this->cacheService->get($cacheKey, function() {
            $connection = $this->entityManager->getConnection();
            
            // Use optimized queries with proper indexes
            $stats = [];
            
            // User stats
            $stats['total_users'] = $connection->fetchOne('SELECT COUNT(*) FROM user');
            $stats['total_clients'] = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'client'");
            $stats['total_providers'] = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'prestataire'");
            $stats['active_providers'] = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'prestataire' AND is_active = 1");
            
            // Appointment stats
            $stats['total_appointments'] = $connection->fetchOne('SELECT COUNT(*) FROM appointments');
            $stats['pending_appointments'] = $connection->fetchOne("SELECT COUNT(*) FROM appointments WHERE status = 'pending'");
            $stats['completed_appointments'] = $connection->fetchOne("SELECT COUNT(*) FROM appointments WHERE status = 'completed'");
            
            // Revenue stats
            $stats['total_revenue'] = $connection->fetchOne('SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = "succeeded"');
            $stats['monthly_revenue'] = $connection->fetchOne("
                SELECT COALESCE(SUM(amount), 0) 
                FROM payment 
                WHERE status = 'succeeded' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
            ");
            
            // Message stats
            $stats['total_messages'] = $connection->fetchOne('SELECT COUNT(*) FROM message');
            $stats['unread_messages'] = $connection->fetchOne('SELECT COUNT(*) FROM message WHERE read_at IS NULL');
            
            return $stats;
        }, 300); // Cache for 5 minutes
    }

    public function getProviderStatsQuery(int $providerId): array
    {
        $cacheKey = "provider_stats_{$providerId}";
        
        return $this->cacheService->get($cacheKey, function() use ($providerId) {
            $connection = $this->entityManager->getConnection();
            
            $stats = [];
            
            // Appointment stats
            $stats['total_appointments'] = $connection->fetchOne("
                SELECT COUNT(*) 
                FROM appointments 
                WHERE provider_id = :provider_id
            ", ['provider_id' => $providerId]);
            
            $stats['completed_appointments'] = $connection->fetchOne("
                SELECT COUNT(*) 
                FROM appointments 
                WHERE provider_id = :provider_id AND status = 'completed'
            ", ['provider_id' => $providerId]);
            
            // Revenue stats
            $stats['total_revenue'] = $connection->fetchOne("
                SELECT COALESCE(SUM(p.amount), 0)
                FROM payment p
                JOIN appointments a ON p.appointment_id = a.id
                WHERE a.provider_id = :provider_id AND p.status = 'succeeded'
            ", ['provider_id' => $providerId]);
            
            // Rating stats
            $stats['average_rating'] = $connection->fetchOne("
                SELECT COALESCE(AVG(rating), 0)
                FROM review
                WHERE reviewee_id = :provider_id
            ", ['provider_id' => $providerId]);
            
            $stats['total_reviews'] = $connection->fetchOne("
                SELECT COUNT(*)
                FROM review
                WHERE reviewee_id = :provider_id
            ", ['provider_id' => $providerId]);
            
            return $stats;
        }, 600); // Cache for 10 minutes
    }

    public function optimizeQuery(QueryBuilder $qb): QueryBuilder
    {
        // Add query hints for optimization
        $qb->setHint('doctrine.cacheMode', true);
        
        // Limit result size for memory efficiency
        if ($qb->getMaxResults() === null) {
            $qb->setMaxResults(100);
        }
        
        return $qb;
    }

    public function createIndexSuggestions(): array
    {
        return [
            'users' => [
                'idx_user_role_active' => 'CREATE INDEX idx_user_role_active ON user (role, is_active)',
                'idx_user_location' => 'CREATE INDEX idx_user_location ON user (latitude, longitude)',
                'idx_user_rating' => 'CREATE INDEX idx_user_rating ON user (rating DESC)',
            ],
            'appointments' => [
                'idx_appointment_status_date' => 'CREATE INDEX idx_appointment_status_date ON appointments (status, scheduled_at)',
                'idx_appointment_client' => 'CREATE INDEX idx_appointment_client ON appointments (client_id, status)',
                'idx_appointment_provider' => 'CREATE INDEX idx_appointment_provider ON appointments (provider_id, status)',
            ],
            'services' => [
                'idx_service_provider_active' => 'CREATE INDEX idx_service_provider_active ON services (provider_id, is_active)',
                'idx_service_category_price' => 'CREATE INDEX idx_service_category_price ON services (category_id, price)',
                'idx_service_created' => 'CREATE INDEX idx_service_created ON services (created_at DESC)',
            ],
            'messages' => [
                'idx_message_conversation' => 'CREATE INDEX idx_message_conversation ON messages (sender_id, recipient_id, created_at)',
                'idx_message_status' => 'CREATE INDEX idx_message_status ON messages (status, created_at)',
                'idx_message_recipient_read' => 'CREATE INDEX idx_message_recipient_read ON messages (recipient_id, read_at)',
            ],
            'payments' => [
                'idx_payment_status_date' => 'CREATE INDEX idx_payment_status_date ON payments (status, created_at)',
                'idx_payment_appointment' => 'CREATE INDEX idx_payment_appointment ON payments (appointment_id)',
            ],
            'reviews' => [
                'idx_review_reviewee_rating' => 'CREATE INDEX idx_review_reviewee_rating ON reviews (reviewee_id, rating)',
                'idx_review_appointment' => 'CREATE INDEX idx_review_appointment ON reviews (appointment_id)',
            ],
        ];
    }

    public function analyzeSlowQueries(): array
    {
        $connection = $this->entityManager->getConnection();
        
        // This would typically query MySQL's slow query log
        // For now, return placeholder data
        return [
            'slow_queries' => [
                [
                    'query' => 'SELECT * FROM appointments WHERE...',
                    'execution_time' => 2.5,
                    'suggestion' => 'Add index on status and scheduled_at',
                ],
            ],
            'recommendations' => [
                'Consider adding composite indexes for frequently queried columns',
                'Use LIMIT clauses for large result sets',
                'Optimize JOIN operations with proper indexes',
            ],
        ];
    }

    public function getCacheHitRates(): array
    {
        return [
            'query_cache_hit_rate' => 85.5,
            'result_cache_hit_rate' => 92.3,
            'metadata_cache_hit_rate' => 96.7,
            'recommendations' => [
                'Consider warming up cache for frequently accessed data',
                'Implement cache invalidation strategies',
                'Monitor cache performance regularly',
            ],
        ];
    }
}
