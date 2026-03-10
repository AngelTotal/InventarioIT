<?php
require_once 'config.php';

if (!isConnected()) {
    jsonResponse([
        [
            "id" => 1, "employee" => "YANSI SANCHEZ", "model" => "Xiaomi Redmi 9A", 
            "area" => "Ventas Exportacion", "email" => "yansi.sanchez23@gmail.com", 
            "comments" => "Lo tiene Mayra", "recovery_account" => "marielena@totalground.com",
            "phone_number" => "3322337435", "password" => "Ground2021*t", "updated_password" => "",
            "birth_date" => "", "app_lock_password" => "", "app_lock_answer" => "", "update_note" => ""
        ]
    ]);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $sql = "SELECT *, employee_name_legacy as employee, email_account as email FROM cellphones ORDER BY employee_name_legacy ASC";
        $stmt = $pdo->query($sql);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO cellphones (employee_name_legacy, model, area, email_account, comments, recovery_account, phone_number, password, updated_password, birth_date, app_lock_password, app_lock_answer, update_note, has_app_lock, app_lock_pattern) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['employee'], $data['model'], $data['area'], $data['email'], 
            $data['comments'] ?? '', $data['recovery_account'] ?? '', $data['phone_number'] ?? '',
            $data['password'] ?? '', $data['updated_password'] ?? '', $data['birth_date'] ?? '',
            $data['app_lock_password'] ?? '', $data['app_lock_answer'] ?? '', $data['update_note'] ?? '',
            $data['has_app_lock'] ?? 0, $data['app_lock_pattern'] ?? ''
        ]);
        jsonResponse(["message" => "Celular registrado", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE cellphones SET employee_name_legacy=?, model=?, area=?, email_account=?, comments=?, recovery_account=?, phone_number=?, password=?, updated_password=?, birth_date=?, app_lock_password=?, app_lock_answer=?, update_note=?, has_app_lock=?, app_lock_pattern=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['employee'], $data['model'], $data['area'], $data['email'], 
            $data['comments'], $data['recovery_account'], $data['phone_number'],
            $data['password'], $data['updated_password'], $data['birth_date'],
            $data['app_lock_password'], $data['app_lock_answer'], $data['update_note'],
            $data['has_app_lock'] ?? 0, $data['app_lock_pattern'] ?? '',
            $id
        ]);
        jsonResponse(["message" => "Celular actualizado"]);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM cellphones WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        jsonResponse(["message" => "Celular eliminado"]);
        break;
}
?>
