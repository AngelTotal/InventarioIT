<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        [
            "id" => 1, 
            "title" => "Configuración VPN", 
            "description" => "Guía paso a paso para conectar a la red corporativa.", 
            "category" => "Redes", 
            "file_url" => "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        ],
        [
            "id" => 2, 
            "title" => "Manual de Usuario ERP", 
            "description" => "Documentación oficial del sistema de gestión.", 
            "category" => "Sistemas", 
            "file_url" => "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        ]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM tutorials ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM tutorials WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Tutorial eliminado"]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE tutorials SET title = ?, description = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['title'], $data['description'], $id]);
        jsonResponse(["message" => "Tutorial actualizado"]);
        break;
}
?>
