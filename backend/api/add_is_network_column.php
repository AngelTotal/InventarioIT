<?php
require_once 'config.php';
try {
    $pdo->exec("ALTER TABLE printers ADD COLUMN IF NOT EXISTS is_network BOOLEAN DEFAULT 0 AFTER assigned_to");
    echo "SUCCESS: Column 'is_network' added to 'printers'.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
