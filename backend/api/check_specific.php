<?php
require_once 'config.php';
$stmt = $pdo->prepare("SELECT network_name, created_at, updated_at FROM enterprise_networks WHERE network_name = ?");
$stmt->execute(['Megacable_5G_58BA']);
echo json_encode($stmt->fetch(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
?>
