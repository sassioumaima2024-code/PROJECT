<?php
require_once 'vendor/autoload.php';
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$repo = $container->get('doctrine')->getRepository(\App\Entity\Category::class);

try {
    $categories = $repo->findAll();
    echo "Found " . count($categories) . " categories.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
