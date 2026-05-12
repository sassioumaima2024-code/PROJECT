<?php
$p = new PDO('mysql:host=127.0.0.1;dbname=servicy', 'root', '');
$res = $p->query("DESCRIBE category")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($res, JSON_PRETTY_PRINT);
