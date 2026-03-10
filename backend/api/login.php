<?php
require_once 'config.php';

$rawBody = file_get_contents("php://input");
$data = json_decode($rawBody);

if ($data) {
    error_log("Login attempt for: " . ($data->username ?? 'no user'));
} else {
    error_log("Login request received but data is null or invalid JSON. Body: " . substr($rawBody, 0, 100));
}

if (!isConnected()) {
    // Fallback Mock Login si no hay DB
    if ($data && isset($data->username) && isset($data->password)) {
        if ($data->username === 'admin' && $data->password === 'admin') {
             jsonResponse([
                "message" => "Login exitoso (Mock)",
                "user" => [
                    "name" => "Administrador TI",
                    "role" => "admin",
                    "avatar" => "https://ui-avatars.com/api/?name=Admin+TI&background=3b82f6&color=fff"
                ]
            ]);
        }
    }
    jsonResponse(["message" => "Credenciales inválidas o sin conexión a DB"], 401);
}

if ($data && isset($data->username) && isset($data->password)) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$data->username]);
    $user = $stmt->fetch();

    if ($user && password_verify($data->password, $user['password'])) {
        unset($user['password']); // No enviar password
        jsonResponse([
            "message" => "Login exitoso",
            "user" => [
                "name" => $user['full_name'],
                "role" => $user['role'],
                "avatar" => $user['avatar']
            ]
        ]);
    } else {
        jsonResponse(["message" => "Usuario o contraseña incorrectos"], 401);
    }
} else {
    jsonResponse(["message" => "Datos incompletos"], 400);
}
?>
