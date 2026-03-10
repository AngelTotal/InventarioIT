<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        [
            "id" => 1, "original_name" => "Mock User", "original_email" => "user@example.com", 
            "backup_name" => "Backup User", "backup_email" => "backup@example.com", 
            "start_date" => "2025-01-01", "end_date" => "2025-02-01", 
            "is_done" => 1, "is_archived" => 0
        ]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM email_backups ORDER BY start_date DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO email_backups (original_name, original_email, backup_name, backup_email, start_date, end_date, is_done, is_archived, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['original_name'], 
            $data['original_email'], 
            $data['backup_name'], 
            $data['backup_email'], 
            $data['start_date'], 
            $data['end_date'] ?? null,
            $data['is_done'] ?? 0,
            $data['is_archived'] ?? 0,
            $data['comments'] ?? ''
        ]);
        jsonResponse(["message" => "Guardado correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE email_backups SET original_name=?, original_email=?, backup_name=?, backup_email=?, start_date=?, end_date=?, is_done=?, is_archived=?, comments=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['original_name'], 
            $data['original_email'], 
            $data['backup_name'], 
            $data['backup_email'], 
            $data['start_date'], 
            $data['end_date'] ?? null,
            $data['is_done'] ?? 0,
            $data['is_archived'] ?? 0,
            $data['comments'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Actualizado correctamente"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM email_backups WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Eliminado correctamente"]);
        break;
}
?>
