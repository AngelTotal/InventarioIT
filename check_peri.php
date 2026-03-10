<?php
require_once 'backend/api/config.php';
$stmt = $pdo->query("DESCRIBE peripherals");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
?>
