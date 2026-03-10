<?php
require_once 'config.php';

if (!isConnected()) {
    echo "No connection to database.";
    exit;
}

try {
    $sqls = [
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `servidor_entrada` VARCHAR(255) DEFAULT ''",
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `puerto_entrada` VARCHAR(20) DEFAULT ''",
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `ssl_entrada` TINYINT(1) DEFAULT 0",
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `servidor_salida` VARCHAR(255) DEFAULT ''",
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `puerto_salida` VARCHAR(20) DEFAULT ''",
        "ALTER TABLE `correos_outlook` ADD COLUMN IF NOT EXISTS `cifrado_salida` VARCHAR(50) DEFAULT 'SSL/TLS'"
    ];

    foreach ($sqls as $sql) {
        $pdo->exec($sql);
        echo "Executed: $sql <br>";
    }

    echo "Table updated successfully.";
} catch (PDOException $e) {
    echo "Error updating table: " . $e->getMessage();
}
?>
