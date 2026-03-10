<?php
require_once 'config.php';
$stmt = $pdo->query("SELECT DISTINCT category FROM hardware_assets");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
?>
