<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM printers ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO printers (name, brand, model, serial, code, is_network, ip_address, zone, assigned_to, supply_type, ink_type, linked_inks, linked_toner, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $data['name'] ?? '',
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['serial'] ?? '',
            $data['code'] ?? '',
            $data['is_network'] ?? 0,
            $data['ip_address'] ?? null,
            $data['zone'] ?? '',
            $data['assigned_to'] ?? '',
            $data['supply_type'] ?? '',
            $data['ink_type'] ?? '',
            $data['linked_inks'] ?? null,
            $data['linked_toner'] ?? null,
            $data['status'] ?? 'Activo',
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Impresora registrada", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE printers SET name=?, brand=?, model=?, serial=?, code=?, is_network=?, ip_address=?, zone=?, assigned_to=?, supply_type=?, ink_type=?, linked_inks=?, linked_toner=?, status=?, comments=? WHERE id=?";
        $pdo->prepare($sql)->execute([
            $data['name'] ?? '',
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['serial'] ?? '',
            $data['code'] ?? '',
            $data['is_network'] ?? 0,
            $data['ip_address'] ?? null,
            $data['zone'] ?? '',
            $data['assigned_to'] ?? '',
            $data['supply_type'] ?? '',
            $data['ink_type'] ?? '',
            $data['linked_inks'] ?? null,
            $data['linked_toner'] ?? null,
            $data['status'] ?? 'Activo',
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Impresora actualizada"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM printers WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Impresora eliminada"]);
        break;
}
?>
