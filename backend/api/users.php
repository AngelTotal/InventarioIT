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
        $sql = "SELECT id, username, fullname, role, avatar, created_at FROM users ORDER BY id";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Usuario eliminado"]);
        break;
}
?>
