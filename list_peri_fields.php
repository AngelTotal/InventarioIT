<?php
require_once 'backend/api/config.php';
$stmt = $pdo->query("DESCRIBE peripherals");
$fields = [];
foreach($stmt->fetchAll() as $row) {
    $fields[] = $row['Field'];
}
echo implode(", ", $fields);
?>
