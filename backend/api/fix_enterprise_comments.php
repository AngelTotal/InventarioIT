<?php
require_once 'config.php';
try {
    // For enterprise_networks, comments is used for 'details'. Let's add 'notes' column.
    $pdo->exec("ALTER TABLE enterprise_networks ADD COLUMN IF NOT EXISTS notes_extra TEXT");
    echo "SUCCESS: Column 'notes_extra' added to 'enterprise_networks'.<br>";
    
    // For hardware_assets, initials etc, they already have comments mapped to 'Notas'.
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
