<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM peripherals ORDER BY name ASC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO peripherals (code, name, brand, model, serial, category, status, location, quantity, comments, assigned_to) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            !empty($data['code']) ? $data['code'] : null,
            $data['name'],
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['serial'] ?? '',
            $data['category'] ?? 'General',
            $data['status'] ?? 'Disponible',
            $data['location'] ?? '',
            $data['quantity'] ?? 1,
            $data['comments'] ?? '',
            $data['assigned_to'] ?? ''
        ]);
        jsonResponse(["message" => "Periférico registrado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE peripherals SET code=?, name=?, brand=?, model=?, serial=?, category=?, status=?, location=?, quantity=?, comments=?, assigned_to=? WHERE id=?";
        $pdo->prepare($sql)->execute([
            !empty($data['code']) ? $data['code'] : null,
            $data['name'],
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['serial'] ?? '',
            $data['category'] ?? 'General',
            $data['status'] ?? 'Disponible',
            $data['location'] ?? '',
            $data['quantity'] ?? 1,
            $data['comments'] ?? '',
            $data['assigned_to'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Periférico actualizado"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM peripherals WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Periférico eliminado"]);
        break;
}
