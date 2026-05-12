<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1', 'root', '');
    $pdo->exec('DROP DATABASE IF EXISTS servicy');
    $pdo->exec('CREATE DATABASE servicy');
    echo "Database 'servicy' reset successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
