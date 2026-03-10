<?php
require_once 'config.php';
$stmt = $pdo->query("SELECT network_name, created_at, updated_at FROM enterprise_networks LIMIT 5");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
?>
