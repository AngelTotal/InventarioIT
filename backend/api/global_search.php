<?php
require_once 'config.php';

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    jsonResponse([]);
}

if (!isConnected()) {
    jsonResponse([]);
}

$words = explode(' ', $query);
$words = array_filter($words, function($w) { return strlen($w) >= 2; });

if (empty($words)) {
    // If all words are 1-char, fallback to simple search or return empty
    $words = [ $query ];
}

$results = [];

// Helper function to build multi-word LIKE clause
function buildMultiWordQuery($fields, $words) {
    $concat = "CONCAT_WS(' ', " . implode(', ', $fields) . ")";
    $clauses = [];
    $params = [];
    foreach ($words as $w) {
        $clauses[] = "$concat LIKE ?";
        $params[] = "%$w%";
    }
    return [
        'sql' => implode(' AND ', $clauses),
        'params' => $params
    ];
}

// 1. hardware_assets (Inventario / Equipos)
$qData = buildMultiWordQuery(['name', 'category', 'code', 'serial', 'brand', 'model', 'assigned_user'], $words);
$sql = "SELECT id, name, category, code, serial, brand as extra, model as subtitle, assigned_user as assigned_to, 'inventory' as source_view 
        FROM hardware_assets 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 2. peripherals
$qData = buildMultiWordQuery(['name', 'category', 'code', 'serial', 'brand', 'model', 'assigned_to'], $words);
$sql = "SELECT id, name, category, code, serial, brand as extra, model as subtitle, assigned_to, 'peripherals' as source_view 
        FROM peripherals 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 3. printers
$qData = buildMultiWordQuery(['name', 'code', 'serial', 'brand', 'model', 'assigned_to', 'ip_address'], $words);
$sql = "SELECT id, name, 'Impresora' as category, code, serial, brand as extra, model as subtitle, assigned_to, 'printers' as source_view, linked_inks, linked_toner 
        FROM printers 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 4. licenses
$qData = buildMultiWordQuery(['name', 'type', 'key_value', 'vendor', 'comments'], $words);
$sql = "SELECT id, name, type as category, '' as code, key_value as serial, vendor as extra, '' as subtitle, LEFT(comments, 100) as assigned_to, 'licenses' as source_view 
        FROM licenses 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 4.5 account_management (Credentiales)
$qData = buildMultiWordQuery(['email', 'account_type', 'assigned_to', 'comments'], $words);
$sql = "SELECT id, email as name, account_type as category, '' as code, '' as serial, assigned_to as extra, status as subtitle, LEFT(comments, 100) as assigned_to, 'account_management' as source_view 
        FROM account_management 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 5. email_backups
$qData = buildMultiWordQuery(['original_name', 'original_email', 'backup_name', 'backup_email'], $words);
$sql = "SELECT id, original_email as name, 'Email' as category, '' as code, '' as serial, backup_email as extra, '' as subtitle, original_name as assigned_to, 'emails' as source_view 
        FROM email_backups 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 6. cellphones
$qData = buildMultiWordQuery(['employee_name_legacy', 'model', 'phone_number', 'email_account', 'area'], $words);
$sql = "SELECT id, model as name, 'Celular' as category, phone_number as code, '' as serial, area as extra, '' as subtitle, employee_name_legacy as assigned_to, 'cellphones' as source_view 
        FROM cellphones 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 7. network_devices (Red)
$qData = buildMultiWordQuery(['device_name', 'device_type', 'ip_address', 'mac_address', 'location'], $words);
$sql = "SELECT id, device_name as name, device_type as category, ip_address as code, mac_address as serial, '' as extra, '' as subtitle, location as assigned_to, 'network' as source_view 
        FROM network_devices 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 8. enterprise_networks (Red Empresarial)
$qData = buildMultiWordQuery(['network_name', 'location', 'comments'], $words);
$sql = "SELECT id, network_name as name, 'Red Empresarial' as category, '' as code, password as serial, location as extra, '' as subtitle, location as assigned_to, 'enterprise_networks' as source_view 
        FROM enterprise_networks 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 9. tutorials
$qData = buildMultiWordQuery(['title', 'description', 'category'], $words);
$sql = "SELECT id, title as name, 'Tutorial' as category, '' as code, '' as serial, '' as extra, '' as subtitle, description as assigned_to, 'tutorials' as source_view 
        FROM tutorials 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 10. inks
$qData = buildMultiWordQuery(['brand', 'model', 'color', 'type'], $words);
$sql = "SELECT id, model as name, 'Tinta' as category, '' as code, color as serial, type as extra, color as subtitle, '' as assigned_to, 'inks' as source_view 
        FROM inks 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 11. toner
$qData = buildMultiWordQuery(['brand', 'model'], $words);
$sql = "SELECT id, model as name, 'Tóner' as category, '' as code, '' as serial, brand as extra, '' as subtitle, '' as assigned_to, 'toner' as source_view 
        FROM toner 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 12. correos_outlook
$qData = buildMultiWordQuery(['correo', 'comentarios'], $words);
$sql = "SELECT id, correo as name, 'Correo Outlook' as category, '' as code, '' as serial, estatus as extra, '' as subtitle, LEFT(comentarios, 100) as assigned_to, 'correos_outlook' as source_view 
        FROM correos_outlook 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

// 13. notes
$qData = buildMultiWordQuery(['title', 'content'], $words);
$sql = "SELECT id, title as name, 'Nota' as category, '' as code, '' as serial, '' as extra, '' as subtitle, LEFT(content, 100) as assigned_to, 'notes' as source_view 
        FROM notes 
        WHERE " . $qData['sql'] . " LIMIT 10";
$stmt = $pdo->prepare($sql);
$stmt->execute($qData['params']);
$results = array_merge($results, $stmt->fetchAll());

jsonResponse($results);
?>
