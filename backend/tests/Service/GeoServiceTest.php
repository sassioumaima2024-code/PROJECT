<?php
namespace App\Tests\Service;

use App\Service\GeoService;
use PHPUnit\Framework\TestCase;
use Doctrine\ORM\EntityManagerInterface;

class GeoServiceTest extends TestCase
{
    public function testCalculateDistance(): void
    {
        // Mock EntityManager
        $em = $this->createMock(EntityManagerInterface::class);
        $service = new GeoService($em);

        // Tunis (36.8065, 10.1615) à Sousse (35.8256, 10.6369)
        $distance = $service->calculateDistance(36.8065, 10.1615, 35.8256, 10.6369);
        
        // La distance réelle est d'environ 140 km
        $this->assertGreaterThan(130, $distance);
        $this->assertLessThan(150, $distance);
    }

    public function testCalculateDistanceZero(): void
    {
        $em = $this->createMock(EntityManagerInterface::class);
        $service = new GeoService($em);

        $distance = $service->calculateDistance(36.8065, 10.1615, 36.8065, 10.1615);
        
        $this->assertEquals(0, $distance);
    }
}
