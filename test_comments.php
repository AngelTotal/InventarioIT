<?php
require_once 'backend/api/config.php';
$stmt = $pdo->query("DESCRIBE peripherals");
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    if ($row['Field'] == 'comments') { echo "FOUND COMMENTS\n"; }
}
?>
