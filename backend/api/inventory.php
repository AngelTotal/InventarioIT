<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isConnected()) {
    $mockData = [
        ["id" => 1, "code" => "INV-MOCK-1", "name" => "Mock Item 1", "category" => "Computadoras", "status" => "Disponible", "location" => "Local"],
        ["id" => 2, "code" => "INV-MOCK-2", "name" => "Mock Item 2", "category" => "Periféricos", "status" => "En Uso", "location" => "Remoto"]
    ];
    jsonResponse($mockData);
}

switch($method) {
    case 'GET':
        // Ahora usamos assigned_user directamente para la migración
        $sql = "SELECT *, assigned_user as assigned_to FROM hardware_assets ORDER BY zone ASC, name ASC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $sql = "INSERT INTO hardware_assets (name, category, format, code, serial, brand, model, status, location, zone, processor, ram, storage, os, has_office, has_winrar, has_reader, has_server, has_printer, assigned_user, supply_type, ink_type, delivery_date, comments) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            $fields = [
                $data['name'], 
                $data['category'] ?? 'Equipo',
                $data['format'] ?? '',
                !empty($data['code']) ? $data['code'] : null, 
                !empty($data['serial']) ? $data['serial'] : null, 
                $data['brand'] ?? '', 
                $data['model'] ?? '',
                $data['status'] ?? 'Disponible', 
                $data['location'] ?? '', 
                $data['zone'] ?? '', 
                $data['processor'] ?? '', 
                $data['ram'] ?? '', 
                $data['storage'] ?? '', 
                $data['os'] ?? '',
                $data['has_office'] ?? 0, 
                $data['has_winrar'] ?? 0, 
                $data['has_reader'] ?? 0, 
                $data['has_server'] ?? 0, 
                $data['has_printer'] ?? 0, 
                $data['assigned_user'] ?? ($data['assigned_to'] ?? ''),
                !empty($data['supply_type']) ? $data['supply_type'] : null,
                !empty($data['ink_type']) ? $data['ink_type'] : null,
                !empty($data['delivery_date']) ? $data['delivery_date'] : null, 
                $data['comments'] ?? ''
            ];
            
            $stmt->execute($fields);
            $newId = $pdo->lastInsertId();
            jsonResponse(["message" => "Equipo registrado", "id" => $newId]);
        } catch (PDOException $e) {
            http_response_code(500);
            jsonResponse(["message" => "Error de BD: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $id = $_GET['id'];
            $data = json_decode(file_get_contents("php://input"), true);
            
            $sql = "UPDATE hardware_assets SET name=?, category=?, format=?, code=?, serial=?, brand=?, model=?, status=?, location=?, zone=?, processor=?, ram=?, storage=?, os=?, has_office=?, has_winrar=?, has_reader=?, has_server=?, has_printer=?, assigned_user=?, supply_type=?, ink_type=?, delivery_date=?, comments=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            
            $fields = [
                $data['name'], 
                $data['category'] ?? 'Equipo',
                $data['format'] ?? '',
                !empty($data['code']) ? $data['code'] : null, 
                !empty($data['serial']) ? $data['serial'] : null, 
                $data['brand'] ?? '', 
                $data['model'] ?? '',
                $data['status'] ?? 'Disponible', 
                $data['location'] ?? '', 
                $data['zone'] ?? '', 
                $data['processor'] ?? '', 
                $data['ram'] ?? '', 
                $data['storage'] ?? '', 
                $data['os'] ?? '',
                $data['has_office'] ?? 0, 
                $data['has_winrar'] ?? 0, 
                $data['has_reader'] ?? 0, 
                $data['has_server'] ?? 0, 
                $data['has_printer'] ?? 0, 
                $data['assigned_user'] ?? ($data['assigned_to'] ?? ''),
                !empty($data['supply_type']) ? $data['supply_type'] : null,
                !empty($data['ink_type']) ? $data['ink_type'] : null,
                !empty($data['delivery_date']) ? $data['delivery_date'] : null, 
                $data['comments'] ?? '',
                $id
            ];
            
            $stmt->execute($fields);
            jsonResponse(["message" => "Equipo actualizado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            jsonResponse(["message" => "Error de BD: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $pdo->prepare("DELETE FROM hardware_assets WHERE id = ?")->execute([$id]);
        jsonResponse(["message" => "Equipo eliminado"]);
        break;
}
?>
