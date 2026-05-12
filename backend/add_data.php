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

    echo "Ajout de comptes avec des noms réels (Ghada, Oumaima, Hedi, etc.)...\n";

    $govIds = $pdo->query("SELECT id FROM governorates")->fetchAll(PDO::FETCH_COLUMN);
    $catIds = $pdo->query("SELECT id FROM categories")->fetchAll(PDO::FETCH_COLUMN);

    if (empty($govIds) || empty($catIds)) {
        die("Erreur : Tables de base vides.\n");
    }

    $realNames = [
        ['Ghada', 'Sassi', 'ghada.sassi@gmail.com'],
        ['Oumaima', 'Sassi', 'oumaima.sassi@gmail.com'],
        ['Hedi', 'Trabelsi', 'hedi.trabelsi@yahoo.fr'],
        ['Bilel', 'Mansour', 'bilel.mansour@gmail.com'],
        ['Mohamed', 'Ayari', 'mohamed.ayari@outlook.com'],
        ['Abderrahmen', 'Gharbi', 'abderrahmen.gharbi@servicy.tn'],
        ['Sami', 'Ben Salem', 'sami.bensalem@gmail.com'],
        ['Ines', 'Bouaziz', 'ines.bouaziz@yahoo.fr'],
        ['Yassine', 'Mejri', 'yassine.mejri@gmail.com'],
        ['Amira', 'Dridi', 'amira.dridi@gmail.com']
    ];

    foreach ($realNames as $index => [$prenom, $nom, $email]) {
        $role = ($index % 2 == 0) ? 'prestataire' : 'client';
        $nomComm = ($role == 'prestataire') ? "'$prenom Services'" : "NULL";
        $govId = $govIds[array_rand($govIds)];
        $phone = "216" . rand(20000000, 99999999);
        
        // Vérifier si l'email existe déjà
        $stmtCheck = $pdo->prepare("SELECT id FROM user WHERE email = ?");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            echo "L'utilisateur $email existe déjà, on passe au suivant.\n";
            continue;
        }

        $sql = "INSERT INTO user (email, roles, password, role, nom_commercial, phone, is_active, is_available_now, bad_ratings_count, governorate_id, created_at, portfolio, documents, categories, governorates) 
                VALUES ('$email', '[]', 'hash', '$role', $nomComm, '$phone', 1, 1, 0, $govId, NOW(), '[]', '[]', '[]', '[]')";
        $pdo->exec($sql);
        $userId = $pdo->lastInsertId();

        if ($role == 'prestataire') {
            $catId = $catIds[array_rand($catIds)];
            $sqlS = "INSERT INTO service (title, category_id, provider_id, price_min, price_max, experience, description, governorates, photos, is_active, created_at)
                     VALUES ('Service de $prenom', $catId, $userId, 40, 150, 8, 'Expertise de $prenom à votre service.', '[]', '[]', 1, NOW())";
            $pdo->exec($sqlS);
        }
    }

    echo "Terminé ! 10 nouveaux comptes avec des noms réels ont été ajoutés.\n";

} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
