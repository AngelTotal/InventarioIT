<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        "active_assets" => 120,
        "assigned_items" => 85,
        "licenses_expiring" => 5,
        "it_users" => 8,
        "recent_activity" => []
    ]);
}

// Obtener contadores reales
$stats = [];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM inventory WHERE status != 'Baja'");
$stats['active_assets'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM inventory WHERE status = 'En Uso'");
$stats['assigned_items'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM licenses WHERE expiration_date < DATE_ADD(CURDATE(), INTERVAL 30 DAY)");
$stats['licenses_expiring'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM users");
$stats['it_users'] = $stmt->fetch()['c'];

// Actividad reciente simulada con ultimas asignaciones
$stmt = $pdo->query("SELECT a.*, i.name as item_name FROM assignments a JOIN inventory i ON a.inventory_id = i.id ORDER BY a.id DESC LIMIT 3");
$stats['recent_activity'] = $stmt->fetchAll();

jsonResponse($stats);
?>
