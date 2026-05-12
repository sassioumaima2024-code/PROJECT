<?php
require_once __DIR__ . '/vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

$dbUrl = parse_url($_SERVER['DATABASE_URL']);
$host = $dbUrl['host'];
$db   = str_replace('/', '', $dbUrl['path']);
$user = $dbUrl['user'];
$pass = $dbUrl['pass'] ?? '';
$port = $dbUrl['port'] ?? 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("INSERT INTO category (name, description, icon) VALUES 
        ('Bricolage', 'Travaux manuels et réparations', '🔨'), 
        ('Plomberie', 'Réparation de fuites et tuyauterie', '🚰'), 
        ('Électricité', 'Installations et dépannages électriques', '⚡'), 
        ('Ménage', 'Entretien et nettoyage à domicile', '🧹')");
    echo "Categories added.";
} catch (Exception $e) {
    echo $e->getMessage();
}
