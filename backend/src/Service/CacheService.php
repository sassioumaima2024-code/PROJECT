<?php

namespace App\Service;

use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Psr\Cache\CacheItemPoolInterface;

class CacheService
{
    private CacheInterface $cache;
    private CacheItemPoolInterface $redis;

    public function __construct(CacheInterface $cache, CacheItemPoolInterface $redis)
    {
        $this->cache = $cache;
        $this->redis = $redis;
    }

    public function get(string $key, callable $callback, int $ttl = 3600): mixed
    {
        return $this->cache->get($key, function (ItemInterface $item) use ($callback, $ttl) {
            $item->expiresAfter($ttl);
            return $callback();
        });
    }

    public function set(string $key, mixed $value, int $ttl = 3600): bool
    {
        return $this->cache->get($key, function (ItemInterface $item) use ($value, $ttl) {
            $item->set($value)->expiresAfter($ttl);
            return $value;
        });
        return true;
    }

    public function delete(string $key): bool
    {
        return $this->cache->delete($key);
    }

    public function clear(): bool
    {
        return $this->cache->clear();
    }

    public function has(string $key): bool
    {
        return $this->cache->hasItem($key);
    }

    // Redis-specific methods for real-time data
    public function getFromRedis(string $key): mixed
    {
        $item = $this->redis->getItem($key);
        return $item->isHit() ? $item->get() : null;
    }

    public function setToRedis(string $key, mixed $value, int $ttl = 3600): bool
    {
        $item = $this->redis->getItem($key);
        $item->set($value)->expiresAfter($ttl);
        return $this->redis->save($item);
    }

    public function deleteFromRedis(string $key): bool
    {
        return $this->redis->deleteItem($key);
    }

    // Cache warming methods
    public function warmupPopularServices(): void
    {
        $this->set('popular_services', $this->getPopularServicesData(), 1800); // 30 minutes
    }

    public function warmupTopProviders(): void
    {
        $this->set('top_providers', $this->getTopProvidersData(), 1800); // 30 minutes
    }

    public function warmupCategories(): void
    {
        $this->set('categories', $this->getCategoriesData(), 3600); // 1 hour
    }

    public function warmupDashboardStats(): void
    {
        $this->set('dashboard_stats', $this->getDashboardStatsData(), 300); // 5 minutes
    }

    // User-specific caching
    public function cacheUserProfile(int $userId, array $profileData): void
    {
        $this->set("user_profile_{$userId}", $profileData, 1800);
    }

    public function getUserProfile(int $userId): ?array
    {
        return $this->get("user_profile_{$userId}", function() {
            return null;
        });
    }

    public function invalidateUserProfile(int $userId): void
    {
        $this->delete("user_profile_{$userId}");
    }

    // Service caching
    public function cacheServices(array $filters, array $services): void
    {
        $key = 'services_' . md5(serialize($filters));
        $this->set($key, $services, 600); // 10 minutes
    }

    public function getCachedServices(array $filters): ?array
    {
        $key = 'services_' . md5(serialize($filters));
        return $this->get($key, function() {
            return null;
        });
    }

    // Appointment caching
    public function cacheUserAppointments(int $userId, array $appointments): void
    {
        $this->set("user_appointments_{$userId}", $appointments, 300); // 5 minutes
    }

    public function getUserAppointments(int $userId): ?array
    {
        return $this->get("user_appointments_{$userId}", function() {
            return null;
        });
    }

    public function invalidateUserAppointments(int $userId): void
    {
        $this->delete("user_appointments_{$userId}");
    }

    // Message caching
    public function cacheConversation(int $userId1, int $userId2, array $messages): void
    {
        $key = "conversation_{$userId1}_{$userId2}";
        $this->set($key, $messages, 120); // 2 minutes
    }

    public function getConversation(int $userId1, int $userId2): ?array
    {
        $key = "conversation_{$userId1}_{$userId2}";
        return $this->get($key, function() {
            return null;
        });
    }

    public function invalidateConversation(int $userId1, int $userId2): void
    {
        $key = "conversation_{$userId1}_{$userId2}";
        $this->delete($key);
    }

    // Location-based caching
    public function cacheNearbyProviders(float $lat, float $lng, int $radius, array $providers): void
    {
        $key = "nearby_providers_{$lat}_{$lng}_{$radius}";
        $this->set($key, $providers, 300); // 5 minutes
    }

    public function getNearbyProviders(float $lat, float $lng, int $radius): ?array
    {
        $key = "nearby_providers_{$lat}_{$lng}_{$radius}";
        return $this->get($key, function() {
            return null;
        });
    }

    // Rate limiting cache
    public function checkRateLimit(string $identifier, int $limit, int $window): bool
    {
        $key = "rate_limit_{$identifier}";
        $current = $this->getFromRedis($key) ?? 0;
        
        if ($current >= $limit) {
            return false;
        }
        
        $this->setToRedis($key, $current + 1, $window);
        return true;
    }

    // Session caching
    public function cacheUserSession(string $sessionId, array $sessionData): void
    {
        $this->setToRedis("session_{$sessionId}", $sessionData, 3600); // 1 hour
    }

    public function getUserSession(string $sessionId): ?array
    {
        return $this->getFromRedis("session_{$sessionId}");
    }

    public function invalidateUserSession(string $sessionId): void
    {
        $this->deleteFromRedis("session_{$sessionId}");
    }

    // Cache invalidation methods
    public function invalidateUserCache(int $userId): void
    {
        $this->invalidateUserProfile($userId);
        $this->invalidateUserAppointments($userId);
        
        // Invalidate conversations
        $pattern = "conversation_{$userId}_*";
        $this->invalidateByPattern($pattern);
    }

    public function invalidateServiceCache(): void
    {
        $this->delete('popular_services');
        $this->delete('top_providers');
        $this->invalidateByPattern('services_*');
    }

    public function invalidateDashboardCache(): void
    {
        $this->delete('dashboard_stats');
    }

    private function invalidateByPattern(string $pattern): void
    {
        // This would require a more sophisticated cache implementation
        // For now, we'll clear the entire cache
        $this->clear();
    }

    // Placeholder methods for data retrieval
    private function getPopularServicesData(): array
    {
        // This would be implemented with actual database queries
        return [];
    }

    private function getTopProvidersData(): array
    {
        // This would be implemented with actual database queries
        return [];
    }

    private function getCategoriesData(): array
    {
        // This would be implemented with actual database queries
        return [];
    }

    private function getDashboardStatsData(): array
    {
        // This would be implemented with actual database queries
        return [];
    }

    // Cache statistics
    public function getCacheStats(): array
    {
        return [
            'cache_type' => 'redis',
            'status' => 'connected',
            'memory_usage' => 'unknown', // Would require Redis INFO command
            'hit_rate' => 'unknown', // Would require tracking
        ];
    }

    // Cache warming for production
    public function warmupProductionCache(): void
    {
        $this->warmupPopularServices();
        $this->warmupTopProviders();
        $this->warmupCategories();
        $this->warmupDashboardStats();
    }

    // Cache cleanup
    public function cleanupExpiredCache(): void
    {
        // Redis automatically handles expired keys
        // This method can be used for manual cleanup if needed
    }
}
