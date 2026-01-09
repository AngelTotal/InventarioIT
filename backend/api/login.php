<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isConnected()) {
    // Fallback Mock Login si no hay DB
    if ($data->username === 'admin' && $data->password === 'admin') {
         jsonResponse([
            "message" => "Login exitoso (Mock)",
            "user" => [
                "name" => "Administrador TI",
                "role" => "admin",
                "avatar" => "https://ui-avatars.com/api/?name=Admin+TI&background=3b82f6&color=fff"
            ]
        ]);
    } elseif ($data->username === 'angel' && $data->password === 'angel') {
         jsonResponse([
            "message" => "Login exitoso (Mock)",
            "user" => [
                "name" => "Angel Usuario",
                "role" => "consulta", // Rol limitado
                "avatar" => "https://ui-avatars.com/api/?name=Angel+U&background=10b981&color=fff"
            ]
        ]);
    } else {
        jsonResponse(["message" => "Credenciales inválidas (Mock)"], 401);
    }
}

if ($data && isset($data->username) && isset($data->password)) {
    // DB Real logic...
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$data->username]);
    $user = $stmt->fetch();

    if ($user && password_verify($data->password, $user['password'])) {
        unset($user['password']); // No enviar password
        jsonResponse([
            "message" => "Login exitoso",
            "user" => [
                "name" => $user['fullname'],
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
