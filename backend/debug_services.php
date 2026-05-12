<?php
require_once __DIR__ . '/vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');
$databaseUrl = $_SERVER['DATABASE_URL'] ?? $_ENV['DATABASE_URL'];
$dbUrl = parse_url($databaseUrl);
$host = $dbUrl['host'];
$db = ltrim($dbUrl['path'], '/');
$user = $dbUrl['user'];
$pass = $dbUrl['pass'] ?? '';
$port = $dbUrl['port'] ?? 3306;
$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
$stmt = $pdo->query("SELECT email, role FROM user WHERE role = 'admin'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
