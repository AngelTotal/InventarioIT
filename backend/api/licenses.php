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

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM licenses WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Licencia eliminada"]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE licenses SET name = ?, expiration_date = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['name'], $data['expiration_date'], $id]);
        jsonResponse(["message" => "Licencia actualizada"]);
        break;
}
?>
