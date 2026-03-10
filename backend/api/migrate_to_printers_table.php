<?php
require_once 'config.php';

try {
    // 1. Find all records in hardware_assets that are printers
    $sql = "SELECT * FROM hardware_assets WHERE category = 'Impresora' OR name LIKE '%impresora%' OR model LIKE '%impresora%'";
    $stmt = $pdo->query($sql);
    $printers = $stmt->fetchAll();

    echo "Found " . count($printers) . " printers in hardware_assets.<br>";

    $inserted = 0;
    foreach ($printers as $p) {
        // Check if already exists by serial or code
        $check = $pdo->prepare("SELECT id FROM printers WHERE serial = ? OR (code = ? AND code IS NOT NULL)");
        $check->execute([$p['serial'], $p['code']]);
        
        if (!$check->fetch()) {
            $ins = $pdo->prepare("INSERT INTO printers (name, brand, model, serial, code, is_network, ip_address, zone, assigned_to, supply_type, ink_type, status, comments) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $ins->execute([
                $p['name'],
                $p['brand'],
                $p['model'],
                $p['serial'],
                $p['code'],
                $p['has_printer'] ?? 0, // mapping guess
                null, // IP not in hardware_assets usually
                $p['zone'],
                $p['assigned_user'] ?? '',
                $p['supply_type'],
                $p['ink_type'],
                $p['status'],
                $p['comments']
            ]);
            $inserted++;
            
            // Optionally delete from hardware_assets if migrated
            // $pdo->prepare("DELETE FROM hardware_assets WHERE id = ?")->execute([$p['id']]);
        }
    }

    echo "Migrated $inserted printers to the new printers table.<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
