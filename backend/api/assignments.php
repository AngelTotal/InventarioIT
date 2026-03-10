<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "inventory_id" => 101, "item_name" => "HP Laptop", "assigned_to" => "Maria Garcia", "department" => "HR", "date_assigned" => "2025-01-10"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Fetch assignments from assignments table (Source of Truth)
        $sql = "SELECT a.id, a.inventory_id, a.assigned_to as employee_name, i.name as item_name, i.code as item_code, 
                a.date_assigned, a.department, a.comments 
                FROM assignments a 
                LEFT JOIN inventory i ON a.inventory_id = i.id
                ORDER BY a.date_assigned DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO assignments (inventory_id, assigned_to, department, date_assigned, comments) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['asset_id'], $data['employee_name'], $data['department'], $data['date_assigned'], $data['comments'] ?? '']);
        
        // Update inventory status if it's a main asset (optional, but good practice)
        // $pdo->prepare("UPDATE inventory SET status = 'En Uso' WHERE id = ?")->execute([$data['asset_id']]);
        
        jsonResponse(["message" => "Asignación creada", "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM assignments WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Asignación eliminada"]);
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $valName = $data['employee_name'] ?? $data['assigned_to'];
        $sql = "UPDATE assignments SET assigned_to = ?, department = ?, comments = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$valName, $data['department'], $data['comments'] ?? '', $id]);
        jsonResponse(["message" => "Asignación actualizada"]);
        break;
}
?>
