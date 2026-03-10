<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "ssid" => "TG-Corporate", "password" => "********", "details" => "Red principal", "location" => "Oficinas"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Now using the actual DB column name 'location'
        $sql = "SELECT id, network_name as ssid, password, comments as details, location, notes_extra as comments, created_at, updated_at FROM enterprise_networks ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        // Map frontend fields (ssid, details) to DB columns (network_name, comments)
        $sql = "INSERT INTO enterprise_networks (network_name, password, comments, location, notes_extra) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['ssid'], 
            $data['password'], 
            $data['details'] ?? null, 
            $data['location'] ?? null,
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Red guardada correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        // Map frontend fields to DB columns
        $sql = "UPDATE enterprise_networks SET network_name=?, password=?, comments=?, location=?, notes_extra=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['ssid'], 
            $data['password'], 
            $data['details'], 
            $data['location'],
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Red actualizada correctamente"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM enterprise_networks WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Red eliminada correctamente"]);
        break;
}
?>
