<?php
require_once 'vendor/autoload.php';
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();
$hasher = $container->get('security.user_password_hasher');

$email = 'prestataire@servicy.tn';
$user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

if (!$user) {
    $user = new User();
    $user->setEmail($email);
    $user->setRole('prestataire');
    $user->setIsActive(true);
    $user->setIsVerified(true);
    $user->setNomCommercial('Ghada Services');
    $user->setPhone('22112233');
    $user->setPassword($hasher->hashPassword($user, 'password123'));
    $em->persist($user);
    $em->flush();
    echo "Compte prestataire créé : $email / password123\n";
} else {
    $user->setPassword($hasher->hashPassword($user, 'password123'));
    $em->flush();
    echo "Compte prestataire mis à jour : $email / password123\n";
}
