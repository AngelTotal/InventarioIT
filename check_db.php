<?php
require_once 'backend/api/config.php';
try {
    $stmt = $pdo->query("DESCRIBE network_devices");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
