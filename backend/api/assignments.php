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
        $sql = "SELECT a.*, i.name as item_name, i.code as item_code 
                FROM assignments a 
                JOIN inventory i ON a.inventory_id = i.id 
                ORDER BY a.date_assigned DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
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
        $sql = "UPDATE assignments SET assigned_to = ?, department = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['assigned_to'], $data['department'], $id]);
        jsonResponse(["message" => "Asignación actualizada"]);
        break;
}
?>
