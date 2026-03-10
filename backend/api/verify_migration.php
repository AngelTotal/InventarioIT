<?php
// Verificar la migración
require_once 'config.php';

try {
    echo "=== VERIFICACIÓN POST-MIGRACIÓN ===\n\n";
    
    // Contar monitores restantes en hardware_assets
    $sqlAssets = "SELECT COUNT(*) as count FROM hardware_assets WHERE LOWER(name) LIKE '%monitor%' OR LOWER(category) LIKE '%monitor%'";
    $stmtAssets = $pdo->query($sqlAssets);
    $assetsCount = $stmtAssets->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Contar monitores en peripherals
    $sqlPeripherals = "SELECT COUNT(*) as count FROM peripherals WHERE LOWER(category) = 'monitor'";
    $stmtPeripherals = $pdo->query($sqlPeripherals);
    $peripheralsCount = $stmtPeripherals->fetch(PDO::FETCH_ASSOC)['count'];
    
    echo "Monitores restantes en hardware_assets: {$assetsCount}\n";
    echo "Monitores en peripherals: {$peripheralsCount}\n\n";
    
    // Mostrar algunos monitores migrados
    $sqlList = "SELECT id, code, name, brand, model, assigned_to, status FROM peripherals WHERE LOWER(category) = 'monitor' LIMIT 10";
    $stmtList = $pdo->query($sqlList);
    $monitors = $stmtList->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($monitors)) {
        echo "Primeros 10 monitores en periféricos:\n";
        echo str_repeat("-", 100) . "\n";
        printf("%-5s %-15s %-30s %-15s %-20s %-15s\n", "ID", "Código", "Nombre", "Marca", "Modelo", "Asignado");
        echo str_repeat("-", 100) . "\n";
        
        foreach ($monitors as $monitor) {
            printf("%-5s %-15s %-30s %-15s %-20s %-15s\n",
                $monitor['id'],
                $monitor['code'] ?? 'N/A',
                substr($monitor['name'] ?? 'N/A', 0, 30),
                $monitor['brand'] ?? 'N/A',
                substr($monitor['model'] ?? 'N/A', 0, 20),
                $monitor['assigned_to'] ?? 'N/A'
            );
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
