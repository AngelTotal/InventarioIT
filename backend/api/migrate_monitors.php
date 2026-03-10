<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // Buscar todos los registros que contengan "monitor" en hardware_assets
    $sql = "SELECT * FROM hardware_assets WHERE LOWER(name) LIKE '%monitor%' OR LOWER(category) LIKE '%monitor%'";
    $stmt = $pdo->query($sql);
    $monitors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($monitors)) {
        echo json_encode(['success' => true, 'message' => 'No se encontraron monitores para migrar', 'migrated' => 0]);
        exit;
    }
    
    $migrated = 0;
    $errors = [];
    
    foreach ($monitors as $monitor) {
        try {
            // Insertar en peripherals
            $insertSql = "INSERT INTO peripherals (
                code, name, brand, model, serial, category, status, 
                location, quantity, assigned_to, comments, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $insertStmt = $pdo->prepare($insertSql);
            $insertStmt->execute([
                $monitor['code'] ?? null,
                $monitor['name'] ?? 'Monitor',
                $monitor['brand'] ?? null,
                $monitor['model'] ?? null,
                $monitor['serial'] ?? null,
                'Monitor',
                $monitor['status'] ?? 'Disponible',
                $monitor['zone'] ?? $monitor['location'] ?? null,
                1, // quantity
                $monitor['assigned_user'] ?? null,
                $monitor['comments'] ?? null
            ]);
            
            // Eliminar de hardware_assets
            $deleteSql = "DELETE FROM hardware_assets WHERE id = ?";
            $deleteStmt = $pdo->prepare($deleteSql);
            $deleteStmt->execute([$monitor['id']]);
            
            $migrated++;
            
        } catch (PDOException $e) {
            $errors[] = "Error migrando ID {$monitor['id']}: " . $e->getMessage();
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Migración completada. {$migrated} monitores transferidos a periféricos.",
        'migrated' => $migrated,
        'total_found' => count($monitors),
        'errors' => $errors
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la migración: ' . $e->getMessage()]);
}
