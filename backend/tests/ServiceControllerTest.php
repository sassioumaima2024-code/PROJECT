<?php
namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ServiceControllerTest extends WebTestCase
{
    public function testListServices(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/services');
        
        $this->assertResponseIsSuccessful();
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('data', $response);
        $this->assertIsArray($response['data']);
    }

    public function testFilterServicesByCategory(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/services', ['category' => 'Plomberie']);
        
        $this->assertResponseIsSuccessful();
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('data', $response);
    }

    public function testCreateServiceRequiresAuth(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/provider/services', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'title' => 'Test Service',
                'category' => 'Plomberie',
                'price_min' => 50,
                'price_max' => 100,
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }
}
