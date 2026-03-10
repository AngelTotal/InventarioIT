<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "device_name" => "Main Router", "device_type" => "Router", "ip_address" => "192.168.1.1", "location" => "Server Room"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM network_devices ORDER BY device_name";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO network_devices (device_name, device_type, ip_address, mac_address, location, comments) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['device_name'], 
            $data['device_type'] ?? 'Genérico', 
            $data['ip_address'], 
            $data['mac_address'] ?? '', 
            $data['location'],
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Dispositivo creado", "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM network_devices WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Dispositivo eliminado"]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE network_devices SET device_name = ?, device_type = ?, ip_address = ?, mac_address = ?, location = ?, comments = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['device_name'], 
            $data['device_type'] ?? 'Genérico', 
            $data['ip_address'], 
            $data['mac_address'] ?? '', 
            $data['location'], 
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Dispositivo actualizado"]);
        break;
}
?>
