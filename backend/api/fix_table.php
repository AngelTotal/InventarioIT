<?php
require_once 'config.php';

try {
    // Check if category exists
    $stmt = $pdo->query("SHOW COLUMNS FROM hardware_assets LIKE 'category'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE hardware_assets ADD COLUMN category VARCHAR(50) DEFAULT 'Equipo' AFTER name");
        echo "Columna 'category' añadida.\n";
    } else {
        echo "Columna 'category' ya existe.\n";
    }

    // Check if supply_type exists
    $stmt = $pdo->query("SHOW COLUMNS FROM hardware_assets LIKE 'supply_type'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE hardware_assets ADD COLUMN supply_type VARCHAR(50) DEFAULT NULL AFTER comments");
        echo "Columna 'supply_type' añadida.\n";
    }

    // Check if ink_type exists
    $stmt = $pdo->query("SHOW COLUMNS FROM hardware_assets LIKE 'ink_type'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE hardware_assets ADD COLUMN ink_type VARCHAR(100) DEFAULT NULL AFTER supply_type");
        echo "Columna 'ink_type' añadida.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
