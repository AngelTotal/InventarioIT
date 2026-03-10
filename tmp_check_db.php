<?php
$host = 'localhost';
$db_name = 'inventario';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(", ", $tables) . "\n";
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            echo "Table $table: " . $stmt->fetchColumn() . " rows\n";
        } catch (PDOException $e) {
            echo "Table $table FAILED: " . $e->getMessage() . "\n";
        }
    }
} catch(PDOException $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
}
