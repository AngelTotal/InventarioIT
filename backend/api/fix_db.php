<?php
require_once 'config.php';

if (!isConnected()) {
    die("Error: No hay conexión a la base de datos.");
}

echo "<h3>Reparando Estructura de Base de Datos (Mantenimiento de Columnas)...</h3>";

try {
    // 1. Reparar HARDWARE_ASSETS
    $qHardware = [
        "ALTER TABLE hardware_assets ADD COLUMN IF NOT EXISTS assigned_user VARCHAR(150)",
        "ALTER TABLE hardware_assets ADD COLUMN IF NOT EXISTS has_reader BOOLEAN DEFAULT 0",
        "ALTER TABLE hardware_assets ADD COLUMN IF NOT EXISTS has_server BOOLEAN DEFAULT 0",
        "ALTER TABLE hardware_assets ADD COLUMN IF NOT EXISTS has_printer BOOLEAN DEFAULT 0"
    ];

    foreach ($qHardware as $q) {
        try {
            $pdo->exec($q);
            echo "<li> hardware_assets: $q - <span style='color:green'>OK</span></li>";
        } catch (Exception $e) { echo "<li> hardware_assets: $q - <span style='color:orange'>Nota: " . $e->getMessage() . "</span></li>"; }
    }

    // 2. Reparar PERIPHERALS (Faltaba assigned_to)
    $qPeripherals = [
        "ALTER TABLE peripherals ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(150)"
    ];

    foreach ($qPeripherals as $q) {
        try {
            $pdo->exec($q);
            echo "<li> peripherals: $q - <span style='color:green'>OK</span></li>";
        } catch (Exception $e) { echo "<li> peripherals: $q - <span style='color:orange'>Nota: " . $e->getMessage() . "</span></li>"; }
    }

    echo "<h4 style='color:green'>¡Reparación Completa!</h4>";
    echo "<p>Por favor, intenta de nuevo la carga: <a href='load_hardware.php'>Cargar Equipos</a></p>";

} catch (Exception $e) {
    echo "<h4 style='color:red'>Error Crítico: " . $e->getMessage() . "</h4>";
}
?>
