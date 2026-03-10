<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $asset_id = $_GET['asset_id'] ?? null;
        $asset_type = $_GET['asset_type'] ?? 'inventory';
        
        if (!$asset_id) {
            jsonResponse(["message" => "Falta asset_id"], 400);
        }
        
        $stmt = $pdo->prepare("SELECT * FROM maintenance_logs WHERE asset_id = ? AND asset_type = ? ORDER BY date DESC");
        $stmt->execute([$asset_id, $asset_type]);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $sql = "INSERT INTO maintenance_logs (asset_id, asset_type, date, description, technician, cost) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            $stmt->execute([
                $data['asset_id'],
                $data['asset_type'] ?? 'inventory',
                $data['date'] ?? date('Y-m-d'),
                $data['description'] ?? '',
                $data['technician'] ?? '',
                $data['cost'] ?? 0
            ]);
            
            jsonResponse(["message" => "Registro de mantenimiento añadido", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            jsonResponse(["message" => "Error: " . $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM maintenance_logs WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Registro eliminado"]);
        break;
}
?>
