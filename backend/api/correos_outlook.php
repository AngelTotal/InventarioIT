<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        ["id" => 1, "correo" => "outlook@example.com", "contraseña" => "****", "estatus" => "ACTIVA", "comentarios" => "Cuenta de prueba"]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT id, correo, contraseña, estatus, comentarios, 
                servidor_entrada, puerto_entrada, ssl_entrada, 
                servidor_salida, puerto_salida, cifrado_salida, 
                created_at, updated_at FROM correos_outlook ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validation
        if (empty($data['correo']) || !filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            jsonResponse(["message" => "Correo obligatorio y formato válido"], 400);
        }
        if (empty($data['contraseña'])) {
            jsonResponse(["message" => "Contraseña obligatoria"], 400);
        }
        if (empty($data['estatus'])) {
            jsonResponse(["message" => "Estatus obligatorio"], 400);
        }

        $sql = "INSERT INTO correos_outlook (correo, contraseña, estatus, comentarios, 
                                           servidor_entrada, puerto_entrada, ssl_entrada, 
                                           servidor_salida, puerto_salida, cifrado_salida) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['correo'], 
            $data['contraseña'], 
            $data['estatus'] ?? 'ACTIVA', 
            $data['comentarios'] ?? '',
            $data['servidor_entrada'] ?? '',
            $data['puerto_entrada'] ?? '',
            $data['ssl_entrada'] ?? 0,
            $data['servidor_salida'] ?? '',
            $data['puerto_salida'] ?? '',
            $data['cifrado_salida'] ?? 'SSL/TLS'
        ]);
        jsonResponse(["message" => "Guardado correctamente", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);

        // Validation
        if (empty($data['correo']) || !filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            jsonResponse(["message" => "Correo obligatorio y formato válido"], 400);
        }
        if (empty($data['contraseña'])) {
            jsonResponse(["message" => "Contraseña obligatoria"], 400);
        }

        $sql = "UPDATE correos_outlook SET correo=?, contraseña=?, estatus=?, comentarios=?, 
                                          servidor_entrada=?, puerto_entrada=?, ssl_entrada=?, 
                                          servidor_salida=?, puerto_salida=?, cifrado_salida=? 
                WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['correo'], 
            $data['contraseña'], 
            $data['estatus'], 
            $data['comentarios'],
            $data['servidor_entrada'] ?? '',
            $data['puerto_entrada'] ?? '',
            $data['ssl_entrada'] ?? 0,
            $data['servidor_salida'] ?? '',
            $data['puerto_salida'] ?? '',
            $data['cifrado_salida'] ?? 'SSL/TLS',
            $id
        ]);
        jsonResponse(["message" => "Actualizado correctamente"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM correos_outlook WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Eliminado correctamente"]);
        break;
}
?>
