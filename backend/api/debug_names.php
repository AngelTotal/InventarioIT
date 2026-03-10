<?php
require_once 'config.php';
$stmt = $pdo->query("SELECT name FROM hardware_assets LIMIT 50");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
?>
