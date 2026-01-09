<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    // Mock Data
    $mockData = [
        ["id" => 1, "code" => "INV-MOCK-1", "name" => "Mock Item 1", "category" => "Computadoras", "status" => "Disponible", "location" => "Local"],
        ["id" => 2, "code" => "INV-MOCK-2", "name" => "Mock Item 2", "category" => "Periféricos", "status" => "En Uso", "location" => "Remoto"]
    ];
    jsonResponse($mockData);
}

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM inventory WHERE status != 'Baja' ORDER BY id DESC"; // Filter out deleted
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO inventory (code, name, category, brand, model, serial, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['code'], $data['name'], $data['category'], $data['brand'], 
            $data['model'] ?? '', $data['serial'], $data['status'], $data['location']
        ]);
        jsonResponse(["message" => "Item creado", "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "UPDATE inventory SET status = 'Baja' WHERE id = ?"; // Soft delete
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Item eliminado"]);
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE inventory SET name = ?, code = ?, status = ?, location = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['name'], $data['code'], $data['status'], $data['location'], $id]);
        jsonResponse(["message" => "Item actualizado"]);
        break;
}
?>
