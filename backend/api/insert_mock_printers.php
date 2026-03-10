<?php
require_once 'config.php';
try {
    $pdo->exec("INSERT INTO printers (name, brand, model, serial, status) VALUES 
        ('Impresora Sistemas', 'HP', 'LaserJet M428fdw', 'SNC123456', 'Activo'),
        ('Impresora Contabilidad', 'Epson', 'EcoTank L3250', 'EPS789012', 'Activo')");
    echo "Mock printers inserted successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
