<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM inks ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO inks (brand, model, color, type, capacity, quantity, purchase_date, expiry_date, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['color'] ?? '',
            $data['type'] ?? '',
            $data['capacity'] ?? '',
            $data['quantity'] ?? 0,
            $data['purchase_date'] ?? null,
            $data['expiry_date'] ?? null,
            $data['status'] ?? 'Disponible',
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Insumo registrado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE inks SET brand=?, model=?, color=?, type=?, capacity=?, quantity=?, purchase_date=?, expiry_date=?, status=?, comments=? WHERE id=?";
        $pdo->prepare($sql)->execute([
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['color'] ?? '',
            $data['type'] ?? '',
            $data['capacity'] ?? '',
            $data['quantity'] ?? 0,
            $data['purchase_date'] ?? null,
            $data['expiry_date'] ?? null,
            $data['status'] ?? 'Disponible',
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Insumo actualizado"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM inks WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Insumo eliminado"]);
        break;
}
?>
