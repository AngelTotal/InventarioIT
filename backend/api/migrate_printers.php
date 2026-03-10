<?php
require_once 'config.php';

try {
    // Update existing records that are obviously printers
    $sql = "UPDATE hardware_assets 
            SET category = 'Impresora' 
            WHERE (name LIKE '%impresora%' OR model LIKE '%impresora%') 
            AND (category = 'Equipo' OR category IS NULL)";
    $count = $pdo->exec($sql);
    echo "Se actualizaron $count registros existentes a categoría 'Impresora'.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
