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
        unset($user['password']); // Don't print password hash for now, just count length
        echo "Username: " . $user['username'] . ", Name: " . $user['full_name'] . "\n";
    }
} catch(PDOException $e) { echo $e->getMessage(); }
