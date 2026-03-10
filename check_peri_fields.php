<?php
require_once 'backend/api/config.php';
$stmt = $pdo->query("DESCRIBE peripherals");
foreach($stmt->fetchAll() as $row) {
    echo $row['Field'] . " - " . ($row['Null'] == 'NO' ? 'NOT NULL' : 'BALA') . "\n";
}
?>
