<?php
namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    public function testRegisterPrestataire(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'prestataire@test.tn',
                'password' => 'Password123',
                'role' => 'prestataire',
                'nom_commercial' => 'Test Prestataire',
                'phone' => '+21620000000',
                'gouvernorats' => ['Tunis'],
                'categories' => ['Plomberie'],
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $response);
        $this->assertTrue($response['otp_required']);
    }

    public function testLoginPrestataire(): void
    {
        $client = static::createClient();
        
        // D'abord créer un compte
        $client->request('POST', '/api/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@example.tn',
                'password' => 'Password123',
                'role' => 'prestataire',
            ])
        );

        // Ensuite vérifier OTP
        $response = json_decode($client->getResponse()->getContent(), true);
        $otp = $response['dev_otp'] ?? null;
        
        if ($otp) {
            $client->request('POST', '/api/verify-otp', [], [], 
                ['CONTENT_TYPE' => 'application/json'],
                json_encode([
                    'email' => 'test@example.tn',
                    'code' => $otp,
                ])
            );
        }

        // Maintenant login
        $client->request('POST', '/api/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@example.tn',
                'password' => 'Password123',
            ])
        );

        $this->assertResponseIsSuccessful();
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $response);
        $this->assertArrayHasKey('user', $response);
    }

    public function testInvalidLogin(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'nonexistent@test.tn',
                'password' => 'WrongPassword',
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }
}
