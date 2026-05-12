<?php
$dbUrl = parse_url('mysql://root:@127.0.0.1:3306/servicy?serverVersion=10.4.32-MariaDB&charset=utf8mb4');
$pdo = new PDO('mysql:host='.$dbUrl['host'].';port='.$dbUrl['port'].';dbname='.trim($dbUrl['path'],'/'), $dbUrl['user'], $dbUrl['pass']??'');
$stmt = $pdo->query("SELECT id, name FROM category");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
