<?php
$p = new PDO('mysql:host=127.0.0.1;dbname=servicy', 'root', '');
$p->exec('ALTER TABLE review ADD is_flagged TINYINT(1) NOT NULL DEFAULT 0');
echo "Column is_flagged added successfully.\n";
