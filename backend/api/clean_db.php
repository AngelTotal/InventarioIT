<?php
/**
 * Script de Limpieza Total
 * Este script elimina todos los registros de la nueva base de datos para dejarla lista para carga manual.
 */
require_once 'config.php';

if (!isConnected()) {
    die("Error: No hay conexión a la base de datos.");
}

echo "<h3>Iniciando Limpieza de Base de Datos 'inventario'...</h3>";

$targetDB = "inventario";

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    $tables = [
        'hardware_assets',
        'peripherals',
        'cellphones',
        'printer_supplies',
        'licenses',
        'enterprise_networks',
        'account_management',
        'email_backups',
        'assignments',
        'calendar_reminders',
        'ftp_catalog',
        'tutorials'
    ];

    foreach ($tables as $table) {
        echo "<li>Vaciando tabla <b>$table</b>... ";
        $pdo->exec("TRUNCATE TABLE $targetDB.$table");
        echo "Limpia.</li>";
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "<br><h4 style='color:green'>¡Sistema Limpio!</h4>";
    echo "<p>Todos los registros han sido eliminados de la base de datos <b>$targetDB</b>. El sistema está ahora vacío y listo para recibir los datos correctos.</p>";

} catch (Exception $e) {
    echo "<br><h4 style='color:red'>Error durante la limpieza: " . $e->getMessage() . "</h4>";
}
?>
