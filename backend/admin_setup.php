<?php
require_once __DIR__ . '/vendor/autoload.php';
use App\Kernel;
use App\Entity\User;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

$kernel = new Kernel('dev', true);
$kernel->boot();
$em = $kernel->getContainer()->get('doctrine')->getManager();

$admin = $em->getRepository(User::class)->findOneBy(['email' => 'admin@servicy.tn']);
if (!$admin) {
    $admin = new User();
    $admin->setEmail('admin@servicy.tn');
    $admin->setRole('admin');
    $admin->setRoles(['ROLE_ADMIN']);
    $admin->setIsActive(true);
    $admin->setCategories([]); $admin->setPortfolio([]); $admin->setDocuments([]); $admin->setGovernorates([]);
}
$admin->setPassword(password_hash('admin123', PASSWORD_BCRYPT));
$em->persist($admin);
$em->flush();

echo "Admin account is ready.\n";
