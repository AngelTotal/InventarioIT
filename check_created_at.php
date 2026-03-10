<?php
require_once 'backend/api/config.php';
$stmt = $pdo->query("DESCRIBE peripherals");
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    if ($row['Field'] == 'created_at') {
        echo "CREATED_AT: Default=" . ($row['Default'] ?: 'NONE') . ", Null=" . $row['Null'] . "\n";
    }
}
?>
