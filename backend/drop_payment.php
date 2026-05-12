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

$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->exec("DROP TABLE IF EXISTS payment");
echo "Table payment dropped if it existed.\n";
