<?php
/**
 * Script de Migración Pro - Puente entre Databases (VERSIÓN TOLERANTE A DUPLICADOS)
 * Este script transfiere los datos desde 'it_inventory' hacia 'inventario' manejando códigos duplicados.
 */
require_once 'config.php';

if (!isConnected()) {
    die("Error: No hay conexión a la base de datos configurada en config.php");
}

echo "<h3>Iniciando Puente de Migración Inteligente (it_inventory -> inventario)...</h3>";

// Base de datos de origen
$sourceDB = "it_inventory";
$targetDB = "inventario";

try {
    // 0. Limpiar tablas destino
    echo "<li>Limpiando tablas nuevas para migración limpia... ";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE $targetDB.hardware_assets");
    $pdo->exec("TRUNCATE TABLE $targetDB.peripherals");
    $pdo->exec("TRUNCATE TABLE $targetDB.cellphones");
    $pdo->exec("TRUNCATE TABLE $targetDB.printer_supplies");
    $pdo->exec("TRUNCATE TABLE $targetDB.licenses");
    $pdo->exec("TRUNCATE TABLE $targetDB.enterprise_networks");
    $pdo->exec("TRUNCATE TABLE $targetDB.account_management");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Listo.</li>";

    // Función para manejar códigos duplicados
    function getSafeCode($pdo, $table, $code) {
        if (empty($code)) return null;
        $check = $pdo->prepare("SELECT COUNT(*) FROM $table WHERE code = ?");
        $check->execute([$code]);
        if ($check->fetchColumn() == 0) return $code;
        
        // Si ya existe, buscar un sufijo disponible
        $i = 2;
        while (true) {
            $newCode = $code . "-" . $i;
            $check->execute([$newCode]);
            if ($check->fetchColumn() == 0) return $newCode;
            $i++;
        }
    }

    // 1. Migrar Inventario -> hardware_assets y peripherals
    echo "<li>Migrando inventario general... ";
    try {
        $oldInv = $pdo->query("SELECT * FROM $sourceDB.inventory")->fetchAll();
        $count = 0;
        foreach ($oldInv as $item) {
            $cat = strtolower($item['category'] ?? '');
            
            // Lógica de separación
            if (strpos($cat, 'laptop') !== false || strpos($cat, 'desktop') !== false || strpos($cat, 'compu') !== false || strpos($cat, 'server') !== false || $cat == 'equipo' || empty($cat)) {
                $safeCode = getSafeCode($pdo, "$targetDB.hardware_assets", $item['code']);
                $sql = "INSERT INTO $targetDB.hardware_assets (code, name, brand, model, serial, processor, ram, storage, os, status, location, zone, has_office, delivery_date, comments) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $pdo->prepare($sql)->execute([
                    $safeCode, $item['name'], $item['brand'], $item['model'], $item['serial'],
                    $item['processor'], $item['ram'], $item['storage'], $item['os'],
                    $item['status'], $item['location'], $item['zone'], $item['has_office'],
                    $item['delivery_date'], $item['comments']
                ]);
            } else {
                $safeCode = getSafeCode($pdo, "$targetDB.peripherals", $item['code']);
                $sql = "INSERT INTO $targetDB.peripherals (code, name, brand, model, serial, category, status, location, quantity, comments) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $pdo->prepare($sql)->execute([
                    $safeCode, $item['name'], $item['brand'], $item['model'], $item['serial'],
                    $item['category'], $item['status'], $item['location'], $item['quantity'] ?? 1, $item['comments']
                ]);
            }
            $count++;
        }
        echo "Éxito ($count registros migrados).</li>";
    } catch(Exception $e) { echo " <span style='color:red'>(Error en Inventory: " . $e->getMessage() . ")</span> "; }

    // 2. Migrar Celulares
    echo "<li>Migrando celulares... ";
    try {
        $oldCels = $pdo->query("SELECT * FROM $sourceDB.cellphones")->fetchAll();
        $count = 0;
        foreach ($oldCels as $cel) {
            $sql = "INSERT INTO $targetDB.cellphones (employee_name_legacy, model, area, email_account, recovery_account, phone_number, password, updated_password, birth_date, app_lock_password, app_lock_answer, status, update_note) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $cel['employee'] ?? '', $cel['model'], $cel['area'], $cel['email'] ?? '', $cel['recovery_account'],
                $cel['phone_number'], $cel['password'], $cel['updated_password'], $cel['birth_date'],
                $cel['app_lock_password'], $cel['app_lock_answer'], $cel['status'] ?? 'En Uso', $cel['update_note']
            ]);
            $count++;
        }
        echo "Éxito ($count registros).</li>";
    } catch(Exception $e) { echo " <span style='color:red'>(Error en Cellphones: " . $e->getMessage() . ")</span> "; }

    // 3. Migrar Tintas -> printer_supplies
    echo "<li>Migrando insumos de impresión... ";
    try {
        $oldInks = $pdo->query("SELECT * FROM $sourceDB.inks")->fetchAll();
        $count = 0;
        foreach ($oldInks as $ink) {
            $sql = "INSERT INTO $targetDB.printer_supplies (brand, model, color, type, capacity, quantity, purchase_date, expiry_date, status, comments) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $ink['brand'], $ink['model'], $ink['color'], $ink['type'], $ink['capacity'],
                $ink['quantity'], $ink['purchase_date'], $ink['expiry_date'], $ink['status'], $ink['comments']
            ]);
            $count++;
        }
        echo "Éxito ($count registros).</li>";
    } catch(Exception $e) { echo " <span style='color:red'>(Error en Tintas: " . $e->getMessage() . ")</span> "; }

    // 4. Licencias
    echo "<li>Migrando licencias... ";
    try {
        $oldLic = $pdo->query("SELECT * FROM $sourceDB.licenses")->fetchAll();
        $count = 0;
        foreach ($oldLic as $lic) {
            $sql = "INSERT INTO $targetDB.licenses (name, type, key_value, password, expiration_date, status, vendor, comments) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $lic['name'], $lic['type'], $lic['key_value'], $lic['password'], $lic['expiration_date'],
                $lic['status'], $lic['vendor'] ?? '', $lic['comments']
            ]);
            $count++;
        }
        echo "Éxito ($count registros).</li>";
    } catch(Exception $e) { echo " <span style='color:red'>(Error en Licencias: " . $e->getMessage() . ")</span> "; }

    // 5. Redes Empresariales
    echo "<li>Migrando redes empresariales... ";
    try {
        $oldNet = $pdo->query("SELECT * FROM $sourceDB.enterprise_networks")->fetchAll();
        $count = 0;
        foreach ($oldNet as $net) {
            $sql = "INSERT INTO $targetDB.enterprise_networks (network_name, vlan, gateway, password, encryption, comments) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $net['ssid'] ?? $net['network_name'], $net['vlan'] ?? '', $net['gateway'] ?? '', 
                $net['password'], $net['encryption'] ?? '', $net['details'] ?? $net['comments']
            ]);
            $count++;
        }
        echo "Éxito ($count registros).</li>";
    } catch(Exception $e) { echo " <span style='color:red'>(Error en Redes: " . $e->getMessage() . ")</span> "; }

    echo "<br><h4 style='color:green'>¡Migración Completada Exitosamente!</h4>";
    echo "<p>El sistema ha detectado y resuelto los códigos duplicados automáticamente.</p>";

} catch (Exception $e) {
    echo "<br><h4 style='color:red'>Error Crítico: " . $e->getMessage() . "</h4>";
}
?>
