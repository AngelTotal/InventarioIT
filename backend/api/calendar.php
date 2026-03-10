<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    jsonResponse([]);
}

switch($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM calendar_reminders ORDER BY event_date ASC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO calendar_reminders (event_date, title, description, is_done) VALUES (?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $data['event_date'],
            $data['title'],
            $data['description'] ?? '',
            isset($data['is_done']) ? (int)$data['is_done'] : 0
        ]);
        jsonResponse(["message" => "Recordatorio guardado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE calendar_reminders SET event_date=?, title=?, description=?, is_done=? WHERE id=?";
        $pdo->prepare($sql)->execute([
            $data['event_date'],
            $data['title'],
            $data['description'] ?? '',
            (int)$data['is_done'],
            $id
        ]);
        jsonResponse(["message" => "Recordatorio actualizado"]);
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $pdo->prepare("DELETE FROM calendar_reminders WHERE id = ?")->execute([$_GET['id']]);
        }
        jsonResponse(["message" => "Recordatorio eliminado"]);
        break;
}
