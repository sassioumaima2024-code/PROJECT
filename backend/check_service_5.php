<?php
require_once 'vendor/autoload.php';
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
use App\Entity\Service;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();

$service = $em->getRepository(Service::class)->find(5);
if ($service) {
    echo "Service found: " . $service->getTitle() . "\n";
} else {
    echo "Service with ID 5 NOT found.\n";
}
