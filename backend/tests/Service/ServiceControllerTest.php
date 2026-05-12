<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ServiceControllerTest extends WebTestCase
{
    private ?string $token = null;

    protected function setUp(): void
    {
        $client = static::createClient();

        // Register and get token
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'provider@test.com',
            'password' => 'password123',
            'role' => 'prestataire',
        ]));

        $loginResponse = $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'provider@test.com',
            'password' => 'password123',
        ]));

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->token = $data['token'] ?? null;
    }

    public function testCreateService(): void
    {
        $client = static::createClient();
        $client->setServerParameter('HTTP_AUTHORIZATION', "Bearer {$this->token}");

        $client->request('POST', '/api/provider/services', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'category' => 'Plomberie',
            'title' => 'Réparation tuyauterie',
            'price' => 50.00,
            'description' => 'Service de plomberie professionnel',
        ]));

        $this->assertResponseStatusCodeSame(201);
    }

    public function testGetServices(): void
    {
        $client = static::createClient();
        $client->setServerParameter('HTTP_AUTHORIZATION', "Bearer {$this->token}");

        $client->request('GET', '/api/provider/services');

        $this->assertResponseStatusCodeSame(200);
    }
}
