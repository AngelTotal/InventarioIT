<?php
require_once 'config.php';
try {
    $sql = "CREATE TABLE IF NOT EXISTS printers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        brand VARCHAR(50),
        model VARCHAR(100),
        serial VARCHAR(100),
        code VARCHAR(50),
        ip_address VARCHAR(45),
        zone VARCHAR(100),
        assigned_to VARCHAR(150),
        supply_type VARCHAR(50),
        ink_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Activo',
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "SUCCESS: Table 'printers' created.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
