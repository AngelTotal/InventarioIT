<?php
require_once 'config.php';
$stmt = $pdo->query("DESCRIBE toner");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
