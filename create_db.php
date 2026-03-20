<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '123456');
    $pdo->exec('CREATE DATABASE IF NOT EXISTS kreatif_portal_content');
    echo "Database created successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
