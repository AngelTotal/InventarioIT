<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM toner ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO toner (brand, model, quantity, status, comentarios) VALUES (?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['quantity'] ?? 0,
            $data['status'] ?? 'NUEVO',
            $data['comentarios'] ?? ''
        ]);
        jsonResponse(["message" => "Tóner registrado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE toner SET brand=?, model=?, quantity=?, status=?, comentarios=? WHERE id=?";
        $pdo->prepare($sql)->execute([
            $data['brand'] ?? '',
            $data['model'] ?? '',
            $data['quantity'] ?? 0,
            $data['status'] ?? 'NUEVO',
            $data['comentarios'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Tóner actualizado"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM toner WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Tóner eliminado"]);
        break;
}
?>
