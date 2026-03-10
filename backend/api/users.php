<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "username" => "admin", "fullname" => "Administrador TI", "role" => "admin", "avatar" => "https://ui-avatars.com/api/?name=Admin"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT id, username, full_name, role, avatar, created_at, updated_at FROM users ORDER BY id";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $avatar = "https://ui-avatars.com/api/?name=".urlencode($data['full_name'])."&background=random";
        $sql = "INSERT INTO users (username, password, full_name, role, avatar, comments) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['username'], $password, $data['full_name'], $data['role'], $avatar, $data['comments'] ?? '']);
        jsonResponse(["message" => "Usuario creado", "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Usuario eliminado"]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['password']) && !empty($data['password'])) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $sql = "UPDATE users SET full_name = ?, username = ?, role = ?, password = ?, comments = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['full_name'], $data['username'], $data['role'], $password, $data['comments'] ?? '', $id]);
        } else {
            $sql = "UPDATE users SET full_name = ?, username = ?, role = ?, comments = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['full_name'], $data['username'], $data['role'], $data['comments'] ?? '', $id]);
        }
        jsonResponse(["message" => "Usuario actualizado"]);
        break;
}
?>
