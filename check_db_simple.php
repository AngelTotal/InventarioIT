<?php
require_once 'backend/api/config.php';
try {
    $stmt = $pdo->query("DESCRIBE network_devices");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . "\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
