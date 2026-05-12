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

    // Get all category IDs
    $catIds = $pdo->query("SELECT id FROM category")->fetchAll(PDO::FETCH_COLUMN);
    if (empty($catIds)) {
        die("Erreur : Aucune catégorie dans la base.\n");
    }

    // Get a provider user
    $providerIds = $pdo->query("SELECT id FROM user WHERE role = 'prestataire'")->fetchAll(PDO::FETCH_COLUMN);
    if (empty($providerIds)) {
        // Create a dummy provider if none exists
        $pdo->exec("INSERT INTO user (email, roles, password, role, is_active, is_available_now, bad_ratings_count, categories, governorates, portfolio, documents) 
            VALUES ('provider_test@servicy.tn', '[]', 'hash', 'prestataire', 1, 1, 0, '[]', '[]', '[]', '[]')");
        $providerId = $pdo->lastInsertId();
    } else {
        $providerId = $providerIds[0];
    }

    // List of Tunisia governorates exactly as they appear in the GeoJSON or close to it
    $governorates = [
        "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", 
        "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", 
        "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", 
        "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
    ];

    $services = [
        "Réparation fuite d'eau",
        "Installation tableau électrique",
        "Nettoyage de printemps",
        "Peinture salon",
        "Dépannage PC",
        "Cours de maths",
        "Montage de meubles",
        "Tonte de pelouse",
        "Coiffure à domicile",
        "Transport de marchandises",
        "Baby-sitting soirée",
        "Photographe mariage"
    ];

    echo "Insertion des services...\n";

    // Insert 5 services per governorate to make sure there is plenty of data
    $stmt = $pdo->prepare("INSERT INTO service (title, category_id, provider_id, price_min, price_max, experience, description, governorates, photos, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', 1, NOW())");

    $count = 0;
    foreach ($governorates as $gov) {
        for ($i = 0; $i < 3; $i++) {
            $title = $services[array_rand($services)] . " - " . $gov;
            $catId = $catIds[array_rand($catIds)];
            $provId = (empty($providerIds)) ? $providerId : $providerIds[array_rand($providerIds)];
            $priceMin = rand(20, 80);
            $priceMax = $priceMin + rand(20, 100);
            $experience = rand(1, 15);
            $description = "Service professionnel et garanti disponible à $gov et ses alentours.";
            
            // Add exactly this governorate, and maybe 1 random other
            $govs = [$gov];
            if (rand(0, 1) == 1) {
                $govs[] = $governorates[array_rand($governorates)];
            }
            $govsJson = json_encode(array_unique($govs));

            $stmt->execute([$title, $catId, $provId, $priceMin, $priceMax, $experience, $description, $govsJson]);
            $count++;
        }
    }

    echo "Terminé ! $count services insérés avec succès dans la base de données.\n";

} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
