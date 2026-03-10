<?php
require_once 'backend/api/config.php';

$data = [
    ['ip' => '192.168.15.1', 'name' => 'WatchGuard Technologies', 'mac' => '00:01:21:46:35:D9'],
    ['ip' => '192.168.15.2', 'name' => 'Hewlett Packard', 'mac' => '98:4B:E1:10:C8:EE'],
    ['ip' => '192.168.15.8', 'name' => 'Elitegroup Computer Systems (ECS)', 'mac' => 'F4:4D:30:B6:60:2D'],
    ['ip' => '192.168.15.26', 'name' => 'Host activo (sin MAC reportada)', 'mac' => ''],
    ['ip' => '192.168.15.27', 'name' => 'Unknown', 'mac' => 'AE:13:22:47:F1:AB'],
    ['ip' => '192.168.15.33', 'name' => 'HP', 'mac' => 'C8:5A:CF:09:83:A0'],
    ['ip' => '192.168.15.34', 'name' => 'Biostar Microtech International', 'mac' => 'F4:B5:20:48:9F:FE'],
    ['ip' => '192.168.15.36', 'name' => 'Wistron Infocomm (Zhongshan)', 'mac' => 'F8:0F:41:27:DC:D1'],
    ['ip' => '192.168.15.38', 'name' => 'Biostar Microtech International', 'mac' => 'F4:B5:20:28:56:91'],
    ['ip' => '192.168.15.48', 'name' => 'TP-Link Systems', 'mac' => '30:68:93:E1:13:61'],
    ['ip' => '192.168.15.55', 'name' => 'Gigabyte Technology', 'mac' => '10:FF:E0:11:A1:03'],
    ['ip' => '192.168.15.63', 'name' => 'Ricoh Company', 'mac' => '00:26:73:81:97:95'],
    ['ip' => '192.168.15.66', 'name' => 'Ricoh Company', 'mac' => '00:26:73:BB:74:6E'],
    ['ip' => '192.168.15.70', 'name' => 'Micro-Star International (MSI)', 'mac' => '30:9C:23:BF:73:FE'],
    ['ip' => '192.168.15.72', 'name' => 'Wistron', 'mac' => '00:26:2D:3D:E6:DD'],
    ['ip' => '192.168.15.78', 'name' => 'Hewlett Packard', 'mac' => 'F4:30:B9:0F:92:F2'],
    ['ip' => '192.168.15.88', 'name' => 'Unknown', 'mac' => '36:98:38:15:F8:21'],
    ['ip' => '192.168.15.100', 'name' => 'Hewlett Packard', 'mac' => '30:8D:99:04:55:40'],
    ['ip' => '192.168.15.101', 'name' => 'Hon Hai Precision Industry (Foxconn)', 'mac' => 'E8:9E:B4:4E:DD:37'],
    ['ip' => '192.168.15.102', 'name' => 'Unknown', 'mac' => '6A:33:6C:1A:F9:6F'],
    ['ip' => '192.168.15.103', 'name' => 'Unknown', 'mac' => '66:4B:3D:62:EB:29'],
    ['ip' => '192.168.15.105', 'name' => 'Hewlett Packard', 'mac' => '5C:8A:38:82:52:2F'],
    ['ip' => '192.168.15.106', 'name' => 'CyberTAN Technology', 'mac' => '24:FE:9A:03:F5:D9'],
    ['ip' => '192.168.15.107', 'name' => 'Amazon Technologies', 'mac' => 'B8:5F:98:D3:3D:9F'],
    ['ip' => '192.168.15.108', 'name' => 'Western Digital', 'mac' => '00:90:A9:EA:29:81'],
    ['ip' => '192.168.15.110', 'name' => 'Mega Well Limited', 'mac' => '10:5B:AD:A8:AA:1D'],
    ['ip' => '192.168.15.113', 'name' => 'Intel Corporate', 'mac' => '40:D1:33:19:4F:A6'],
    ['ip' => '192.168.15.117', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A2:96:78'],
    ['ip' => '192.168.15.118', 'name' => 'Hewlett Packard', 'mac' => '3C:52:82:6F:3A:80'],
    ['ip' => '192.168.15.122', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A3:7F:04'],
    ['ip' => '192.168.15.123', 'name' => 'Unknown', 'mac' => 'BE:F0:82:83:DB:7C'],
    ['ip' => '192.168.15.126', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:56:30:2A'],
    ['ip' => '192.168.15.127', 'name' => 'Ubiquiti', 'mac' => 'F0:9F:C2:56:CE:DC'],
    ['ip' => '192.168.15.131', 'name' => 'Speed Dragon Multimedia Limited', 'mac' => '00:13:3B:A1:15:C1'],
    ['ip' => '192.168.15.132', 'name' => 'Unknown', 'mac' => 'B2:44:D5:7C:CC:5A'],
    ['ip' => '192.168.15.134', 'name' => 'Apple', 'mac' => '00:F7:6F:EF:8C:55'],
    ['ip' => '192.168.15.136', 'name' => 'Ubiquiti', 'mac' => '44:D9:E7:7A:E7:AA'],
    ['ip' => '192.168.15.137', 'name' => 'Unknown', 'mac' => '1A:E3:19:E7:69:4A'],
    ['ip' => '192.168.15.140', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:B5:F9:1C'],
    ['ip' => '192.168.15.148', 'name' => 'Unknown', 'mac' => 'BA:EB:1E:72:FF:7C'],
    ['ip' => '192.168.15.149', 'name' => 'Unknown', 'mac' => 'F2:27:E8:B2:8C:FD'],
    ['ip' => '192.168.15.152', 'name' => 'Laird Connectivity', 'mac' => 'C0:EE:40:12:85:BF'],
    ['ip' => '192.168.15.153', 'name' => 'Unknown', 'mac' => '72:23:C7:51:05:47'],
    ['ip' => '192.168.15.154', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:56:3E:9C'],
    ['ip' => '192.168.15.156', 'name' => 'Seiko Epson', 'mac' => '64:C6:D2:BD:2F:96'],
    ['ip' => '192.168.15.157', 'name' => 'Cloud Network Technology (TP-Link OEM)', 'mac' => 'A8:3B:76:2C:CD:8F'],
    ['ip' => '192.168.15.159', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A1:7E:5D'],
    ['ip' => '192.168.15.160', 'name' => 'Hewlett Packard', 'mac' => 'F8:B4:6A:AA:08:5C'],
    ['ip' => '192.168.15.161', 'name' => 'Synology Incorporated', 'mac' => '90:09:D0:68:D9:04'],
    ['ip' => '192.168.15.162', 'name' => 'Ricoh Company', 'mac' => '00:26:73:B3:FF:21'],
    ['ip' => '192.168.15.164', 'name' => 'Ricoh Company', 'mac' => '58:38:79:B2:2D:CD'],
    ['ip' => '192.168.15.169', 'name' => 'Unknown', 'mac' => '1E:40:A1:7D:61:83'],
    ['ip' => '192.168.15.176', 'name' => 'Hewlett Packard', 'mac' => 'F4:30:B9:15:FB:DF'],
    ['ip' => '192.168.15.180', 'name' => 'Unknown', 'mac' => 'A2:E1:44:3C:3A:DA'],
    ['ip' => '192.168.15.182', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:C6:75:A8'],
    ['ip' => '192.168.15.183', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A6:C4:65'],
    ['ip' => '192.168.15.184', 'name' => 'Unknown', 'mac' => '6A:3F:17:07:95:AF'],
    ['ip' => '192.168.15.186', 'name' => 'Unknown', 'mac' => 'BA:94:8F:B0:04:79'],
    ['ip' => '192.168.15.188', 'name' => 'Compal Information (Kunshan)', 'mac' => 'B8:88:E3:8D:4D:EA'],
    ['ip' => '192.168.15.189', 'name' => 'Compal Information (Kunshan)', 'mac' => 'BC:EC:A0:38:CC:B3'],
    ['ip' => '192.168.15.190', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A1:7E:4D'],
    ['ip' => '192.168.15.194', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:59:A3:69'],
    ['ip' => '192.168.15.195', 'name' => 'Hewlett Packard', 'mac' => '10:60:4B:85:30:7A'],
    ['ip' => '192.168.15.196', 'name' => 'Private (MAC random / virtual)', 'mac' => '00:17:61:10:32:F4'],
    ['ip' => '192.168.15.199', 'name' => 'Hewlett Packard', 'mac' => 'E4:E7:49:3A:30:C0'],
    ['ip' => '192.168.15.202', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A3:7C:1A'],
    ['ip' => '192.168.15.206', 'name' => 'Unknown', 'mac' => '46:8C:E1:65:6A:99'],
    ['ip' => '192.168.15.211', 'name' => 'Unknown', 'mac' => '72:5E:93:15:1F:37'],
    ['ip' => '192.168.15.219', 'name' => 'HP', 'mac' => '48:9E:BD:29:A1:C2'],
    ['ip' => '192.168.15.220', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A3:67:72'],
    ['ip' => '192.168.15.224', 'name' => 'Apple', 'mac' => '20:C9:D0:C6:B2:9D'],
    ['ip' => '192.168.15.227', 'name' => 'Cloud Network Technology', 'mac' => 'C8:A3:E8:26:EE:55'],
    ['ip' => '192.168.15.229', 'name' => 'LCFC (Hefei) Electronics – Lenovo', 'mac' => 'C8:53:09:A2:97:4D'],
    ['ip' => '192.168.15.230', 'name' => 'Seiko Epson', 'mac' => '44:D2:44:00:B9:F6'],
    ['ip' => '192.168.15.234', 'name' => 'Intel Corporate', 'mac' => '08:71:90:93:1F:DE'],
    ['ip' => '192.168.15.235', 'name' => 'Wistron Infocomm (Zhongshan)', 'mac' => 'F8:0F:41:27:DB:CF'],
    ['ip' => '192.168.15.239', 'name' => 'Micro-Star International (MSI)', 'mac' => '34:5A:60:B6:36:FD'],
    ['ip' => '192.168.15.244', 'name' => 'Ricoh Company', 'mac' => '00:26:73:B3:FE:CC'],
    ['ip' => '192.168.15.246', 'name' => 'Unknown', 'mac' => 'F2:26:4A:F9:13:44'],
    ['ip' => '192.168.15.247', 'name' => 'Wistron Infocomm (Zhongshan)', 'mac' => 'F8:0F:41:26:92:13'],
    ['ip' => '192.168.15.250', 'name' => 'Grandstream Networks', 'mac' => 'C0:74:AD:74:4E:9C'],
    ['ip' => '192.168.15.251', 'name' => 'Grandstream Networks', 'mac' => 'C0:74:AD:74:4E:00'],
];

function getDeviceType($name) {
    $name = strtolower($name);
    if (strpos($name, 'watchguard') !== false) return 'Firewall';
    if (strpos($name, 'ricoh') !== false || strpos($name, 'epson') !== false) return 'Impresora';
    if (strpos($name, 'ubiquiti') !== false) return 'Access Point';
    if (strpos($name, 'tp-link') !== false || strpos($name, 'grandstream') !== false) return 'Network Device';
    if (strpos($name, 'synology') !== false || strpos($name, 'western digital') !== false) return 'Almacenamiento';
    if (strpos($name, 'apple') !== false || strpos($name, 'hewlett packard') !== false || strpos($name, 'hp') !== false || strpos($name, 'lenovo') !== false || strpos($name, 'lcfc') !== false || strpos($name, 'gigabyte') !== false || strpos($name, 'msi') !== false || strpos($name, 'biostar') !== false) return 'Equipo de Cómputo';
    return 'Genérico';
}

function getBrand($name) {
    if (strpos($name, 'LCFC') !== false) return 'Lenovo';
    if (strpos($name, 'Hon Hai') !== false) return 'Foxconn';
    if (strpos($name, 'TP-Link') !== false) return 'TP-Link';
    if (strpos($name, 'Cloud Network') !== false) return 'TP-Link OEM';
    return explode(' ', $name)[0]; // Just the first word as a guess
}

$inserted = 0;
$skipped = 0;

foreach ($data as $item) {
    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM network_devices WHERE ip_address = ? OR (mac_address = ? AND mac_address != '')");
    $stmt->execute([$item['ip'], $item['mac']]);
    if ($stmt->fetch()) {
        $skipped++;
        continue;
    }

    $type = getDeviceType($item['name']);
    $brand = getBrand($item['name']);
    
    $sql = "INSERT INTO network_devices (device_name, device_type, ip_address, mac_address, location, brand, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $item['name'],
        $type,
        $item['ip'],
        $item['mac'],
        'Red Local / Escaneado',
        $brand,
        'Activo',
        'Importado inteligentemente por Antigravity'
    ]);
    $inserted++;
}

echo "Proceso completado.\nInsertados: $inserted\nOmitidos (ya existen): $skipped\n";
?>
