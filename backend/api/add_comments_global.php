<?php
require_once 'config.php';
try {
    $tables = [
        'users',
        'employees',
        'network_devices',
        'calendar_reminders',
        'tutorials',
        'ftp_catalog',
        'email_backups',
        'office_emails',
        'microsoft_emails',
        'assignments'
    ];

    foreach ($tables as $table) {
        try {
            $pdo->exec("ALTER TABLE $table ADD COLUMN IF NOT EXISTS comments TEXT");
            echo "SUCCESS: Column 'comments' added to '$table'.<br>";
        } catch (Exception $e) {
            echo "SKIPPED/ERROR on '$table': " . $e->getMessage() . "<br>";
        }
    }
} catch (Exception $e) {
    echo "GENERAL ERROR: " . $e->getMessage();
}
?>
