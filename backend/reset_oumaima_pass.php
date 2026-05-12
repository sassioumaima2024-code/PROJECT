<?php
require_once 'vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$dbUrl = parse_url($_SERVER['DATABASE_URL']);
$host = $dbUrl['host'];
$db   = str_replace('/', '', $dbUrl['path']);
$user = $dbUrl['user'];
$pass = $dbUrl['pass'] ?? '';
$port = $dbUrl['port'] ?? 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = 'ghada.sassi@gmail.com';
    $hash = '$2y$13$AGjLEeOG2eWmCDqDkl6oN.QCq0BwgpCdLaMqkLkF3E3K/.ppPqSjO'; // admin123
    
    $stmt = $pdo->prepare("UPDATE user SET password = ?, role = 'prestataire' WHERE email = ?");
    $stmt->execute([$hash, $email]);

    echo "Mot de passe de $email mis à jour : admin123\n";

} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
