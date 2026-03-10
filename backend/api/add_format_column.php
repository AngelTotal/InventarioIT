<?php
require_once 'config.php';

try {
    // Add format column if it doesn't exist
    // Placing it after 'id' or 'name' usually
    $sql = "ALTER TABLE hardware_assets ADD COLUMN format VARCHAR(100) DEFAULT NULL";
    $pdo->exec($sql);
    echo "Column 'format' added successfully.";
} catch (PDOException $e) {
    echo "Error adding column (it might already exist): " . $e->getMessage();
}
?>
