<?php
$host = 'localhost';
$db_name = 'inventario';
$username = 'root';
$password = '';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $stmt = $pdo->query("SELECT * FROM users");
    $users = $stmt->fetchAll();
    foreach ($users as $user) {
        $isHash = (strlen($user['password']) > 20 && strpos($user['password'], '$') === 0);
        echo "Username: " . $user['username'] . ", IsHash: " . ($isHash ? 'Yes' : 'No') . ", Hash: " . substr($user['password'], 0, 10) . "...\n";
    }
} catch(PDOException $e) { echo $e->getMessage(); }
