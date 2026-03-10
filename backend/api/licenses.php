<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "name" => "Antivirus Corp", "type" => "Licencia", "expiration_date" => "2026-05-20", "vendor" => "Symantec"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM licenses ORDER BY expiration_date ASC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO licenses (name, type, key_value, password, expiration_date, status, comments, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'], 
            $data['type'], 
            $data['key_value'] ?? null, 
            $data['password'] ?? null, 
            $data['expiration_date'] ?? null, 
            $data['status'],
            $data['comments'] ?? null,
            $data['link'] ?? null
        ]);
        jsonResponse(["message" => "Guardado correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM licenses WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Eliminado correctamente"]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE licenses SET name = ?, type = ?, key_value = ?, password = ?, expiration_date = ?, status = ?, comments = ?, link = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'], 
            $data['type'], 
            $data['key_value'] ?? null, 
            $data['password'] ?? null, 
            $data['expiration_date'] ?? null, 
            $data['status'], 
            $data['comments'] ?? null,
            $data['link'] ?? null,
            $id
        ]);
        jsonResponse(["message" => "Actualizado correctamente"]);
        break;
}
?>
