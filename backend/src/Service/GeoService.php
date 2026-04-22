<?php
namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;

class GeoService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function findNearbyProviders(float $lat, float $lng, float $radius = 10): array
    {
        $conn = $this->em->getConnection();
        $sql = "
            SELECT id, nom_commercial, phone, latitude, longitude, categories,
            (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(latitude))
                    * cos(radians(longitude) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(latitude))
                )
            ) AS distance
            FROM `user`
            WHERE role = 'prestataire'
              AND is_active = 1
              AND is_available_now = 1
              AND latitude IS NOT NULL
              AND longitude IS NOT NULL
            HAVING distance < :radius
            ORDER BY distance ASC
            LIMIT 20
        ";
        return $conn->executeQuery($sql, [
            'lat'    => $lat,
            'lng'    => $lng,
            'radius' => $radius,
        ])->fetchAllAssociative();
    }

    public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return round($earthRadius * $c, 2);
    }
}