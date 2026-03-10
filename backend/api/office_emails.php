<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "email" => "admin@totalground.com", "status" => "ACTIVA", "activation_date" => "2024-01-01", "renewal_date" => "2025-01-01"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM office_emails ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO office_emails (email, password, status, activation_date, renewal_date, comments) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['email'], 
            $data['password'], 
            $data['status'] ?? 'ACTIVA', 
            $data['activation_date'] ?? null, 
            $data['renewal_date'] ?? null,
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Guardado correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE office_emails SET email=?, password=?, status=?, activation_date=?, renewal_date=?, comments=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['email'], 
            $data['password'], 
            $data['status'], 
            $data['activation_date'], 
            $data['renewal_date'],
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Actualizado correctamente"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM office_emails WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Eliminado correctamente"]);
        break;
}
?>
