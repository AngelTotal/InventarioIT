<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Manejo de preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db_name = 'it_inventory';
$username = 'root';
$password = ''; // Configurar segun entorno del usuario

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Si falla la conexión, permitimos fallar silenciosamente para propositos de demo
    // OJO: En produccion esto debe manejarse mejor.
    // echo "Connection error: " . $e->getMessage();
    // Continuamos pero $pdo será null si falla
    $pdo = null;
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Simulacion de DB si no hay conexion real (Para que el frontend no falle totalmente en demo)
function isConnected() {
    global $pdo;
    return $pdo !== null;
}
?>
