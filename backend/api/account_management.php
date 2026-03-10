<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "email" => "admin@example.com", "account_type" => "Microsoft 365", "assigned_to" => "Admin TI", "status" => "Activo", "password" => "********", "comments" => "Cuenta principal"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT id, email, password, account_type, assigned_to, employee_id, status, comments, created_at, updated_at FROM account_management ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO account_management (email, password, account_type, assigned_to, employee_id, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['email'], 
            $data['password'] ?? '', 
            $data['account_type'], 
            $data['assigned_to'] ?? null, 
            $data['employee_id'] ?? null,
            $data['status'] ?? 'Activo',
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Guardado correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE account_management SET email=?, password=?, account_type=?, assigned_to=?, employee_id=?, status=?, comments=?, updated_at=CURRENT_TIMESTAMP WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['email'], 
            $data['password'], 
            $data['account_type'], 
            $data['assigned_to'], 
            $data['employee_id'],
            $data['status'],
            $data['comments'],
            $id
        ]);
        jsonResponse(["message" => "Actualizado correctamente"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM account_management WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Eliminado correctamente"]);
        break;
}
?>
