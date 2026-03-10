<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM notes ORDER BY created_at DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO notes (title, content) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['content'] ?? null
        ]);
        jsonResponse(["message" => "Nota guardada", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE notes SET title = ?, content = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['content'] ?? null,
            $id
        ]);
        jsonResponse(["message" => "Nota actualizada"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        if (strpos($id, ',') !== false) {
            // Bulk delete
            $ids = explode(',', $id);
            $placeholders = str_repeat('?,', count($ids) - 1) . '?';
            $sql = "DELETE FROM notes WHERE id IN ($placeholders)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ids);
        } else {
            $sql = "DELETE FROM notes WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
        }
        jsonResponse(["status" => "success", "message" => "Nota(s) eliminada(s)"]);

        break;
}
?>
