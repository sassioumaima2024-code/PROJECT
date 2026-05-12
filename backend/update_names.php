<?php
require_once __DIR__ . '/vendor/autoload.php';
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

$databaseUrl = $_SERVER['DATABASE_URL'] ?? $_ENV['DATABASE_URL'] ?? null;
if (!$databaseUrl) {
    echo "DATABASE_URL not set in .env\n";
    exit(1);
}
$dbUrl = parse_url($databaseUrl);
$host = $dbUrl['host'];
$db   = ltrim($dbUrl['path'], '/');
$user = $dbUrl['user'];
$pass = $dbUrl['pass'] ?? '';
$port = $dbUrl['port'] ?? 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
    exit(1);
}

$realNames = ['Aarij','Fatma','Hama','Amir','Bilel','Sami','Ines','Yassine','Amira','Mohamed'];
$stmt = $pdo->query("SELECT id, role FROM `user` WHERE role IN ('prestataire','client')");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
$updated = 0;
foreach ($users as $userRow) {
    $first = $realNames[array_rand($realNames)];
    if ($userRow['role'] === 'prestataire') {
        $nomCommercial = $first . ' Services';
        $pdo->prepare('UPDATE `user` SET nom_commercial = ? WHERE id = ?')->execute([$nomCommercial, $userRow['id']]);
    } else {
        $pdo->prepare('UPDATE `user` SET nom_commercial = ? WHERE id = ?')->execute([$first, $userRow['id']]);
    }
    $updated++;
}

echo "Names updated for $updated users.\n";
?>
