<?php
// Script para verificar cuántos monitores hay antes de migrar
require_once 'config.php';

try {
    echo "=== VERIFICACIÓN DE MONITORES EN HARDWARE_ASSETS ===\n\n";
    
    // Buscar registros con "monitor" en el nombre o categoría
    $sql = "SELECT id, code, name, brand, model, category, status, zone, assigned_user 
            FROM hardware_assets 
            WHERE LOWER(name) LIKE '%monitor%' OR LOWER(category) LIKE '%monitor%'";
    
    $stmt = $pdo->query($sql);
    $monitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total de monitores encontrados: " . count($monitors) . "\n\n";
    
    if (!empty($monitors)) {
        echo "Detalles de los monitores:\n";
        echo str_repeat("-", 100) . "\n";
        printf("%-5s %-15s %-30s %-15s %-20s %-15s\n", "ID", "Código", "Nombre", "Marca", "Categoría", "Asignado");
        echo str_repeat("-", 100) . "\n";
        
        foreach ($monitors as $monitor) {
            printf("%-5s %-15s %-30s %-15s %-20s %-15s\n",
                $monitor['id'],
                $monitor['code'] ?? 'N/A',
                substr($monitor['name'] ?? 'N/A', 0, 30),
                $monitor['brand'] ?? 'N/A',
                $monitor['category'] ?? 'N/A',
                $monitor['assigned_user'] ?? 'N/A'
            );
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
