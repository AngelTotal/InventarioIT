<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "name" => "Main Router", "ip_address" => "192.168.1.1", "type" => "Router", "status" => "Online"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM network_devices ORDER BY type";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
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
        $sql = "UPDATE network_devices SET name = ?, ip_address = ?, status = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['name'], $data['ip_address'], $data['status'], $id]);
        jsonResponse(["message" => "Dispositivo actualizado"]);
        break;
}
?>
