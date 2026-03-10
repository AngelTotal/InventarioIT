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

$stmt = $pdo->query("SELECT COUNT(*) as c FROM hardware_assets WHERE status != 'Baja'");
$stats['active_assets'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM assignments a 
                     JOIN hardware_assets h ON a.asset_id = h.id 
                     WHERE a.asset_type = 'Hardware' AND a.date_returned IS NULL");
$stats['assigned_items'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM licenses WHERE expiration_date < DATE_ADD(CURDATE(), INTERVAL 30 DAY)");
$stats['licenses_expiring'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM users");
$stats['it_users'] = $stmt->fetch()['c'];

$stmt = $pdo->query("SELECT COUNT(*) as c FROM printers");
$stats['printers_count'] = $stmt->fetch()['c'];

// Actividad reciente con ultimas asignaciones
$stmt = $pdo->query("SELECT a.id, a.date_assigned, e.full_name as employee_name, h.name as item_name 
                     FROM assignments a 
                     JOIN employees e ON a.employee_id = e.id
                     JOIN hardware_assets h ON a.asset_id = h.id 
                     WHERE a.asset_type = 'Hardware'
                     ORDER BY a.id DESC LIMIT 3");
$stats['recent_activity'] = $stmt->fetchAll();

jsonResponse($stats);
?>
