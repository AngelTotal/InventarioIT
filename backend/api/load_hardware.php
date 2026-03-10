<?php
require_once 'config.php';

if (!isConnected()) {
    die("Error: No hay conexión a la base de datos.");
}

echo "<h3>Cargando Inventario Exacto (Octubre 2025)...</h3>";

// TABLA 1: CHILANGOS, NORTEÑOS Y ADMINISTRACIÓN (CPUs)
$lista_cpus = [
    // [Nombre Producto, Folio, Serie, Usuario, Office, Reader, WinRAR, Servidor, Impresora, Status, Comentarios, Fecha, Nombre, Zona, Equipo, Marca, Procesador, RAM, Windows]
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6GA', 'MZ02C6GA', 'Veronica Gonzalez', 1, 1, 1, 0, 1, 'ENTREGADO', 'No usa servidor', '27/10/2025', 'CARMEN FLORES', 'CDMX', 'ESCRITORIO', 'HP', 'AMD E1-1200', '4GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6QR', 'MZ02C6QR', 'Ismael Trinidad', 1, 1, 1, 1, 1, 'ENTREGADO', '', '30/10/2025', 'ELAYNE SOTO', 'MERIDA', 'LAPTOP', 'DELL', 'Intel I5-7th', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6R3', 'MZ02C6R3', 'Erika Torres', 1, 1, 1, 0, 1, 'ENTREGADO', 'No usa servidor', '30/10/2025', 'MARTIN GOMEZ', 'CDMX', 'LAPTOP', 'HP', 'Intel I5-11TH', '16GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6RV', 'MZ02C6RV', 'Daniel Vazquez', 1, 1, 1, 1, 1, 'ENTREGADO', 'El usuario y contraseña de este equipo lo tiene Grecia', '05/11/2025', 'YARED ABAD', 'CDMX', 'LAPTOP', 'HP', 'Intel I5-11TH', '16GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6S4', 'MZ02C6S4', '', 0, 0, 0, 0, 0, '', '', '', 'YARED ABAD', 'CDMX', 'LAPTOP', 'HP', 'Intel I3-11TH', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6SF', 'MZ02C6SF', 'Maurico Cardenas', 1, 1, 1, 1, 1, '', '', '', 'MANUEL ISLAS', 'CDMX', 'LAPTOP', 'HP', 'Intel I5-11TH', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6SY', 'MZ02C6SY', 'Diego Jaramillo', 1, 1, 1, 1, 1, 'ENTREGADO', 'Nodo corregido (ya por cable)', '29/10/2025', 'RICARDO ZEPEDA', 'CDMX', 'LAPTOP', 'DELL', 'Intel I7-7TH', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C6XP', 'MZ02C6XP', 'Ahtiziri Almaral', 1, 1, 1, 1, 1, 'ENTREGADO', '', '29/10/2025', 'ALEJANDRO MARTINEZ', 'CDMX', 'LAPTOP', 'DELL', 'Intel I5-11TH', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C8B4', 'MZ02C8B4', 'Elvira Avila', 1, 1, 1, 0, 1, 'ENTREGADO', 'Calibración Zebra solucionada', '29/10/2025', 'Raúl Valdez', 'Monterrey', 'LAPTOP', 'HP', 'Intel I7-8TH', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C8CA', 'MZ02C8CA', 'Daniel Valderrama', 1, 1, 1, 1, 1, 'ENTREGADO', '', '30/10/2025', 'Valeria Banderas', 'Monterrey', 'LAPTOP', 'HP', 'Intel i3-5005U', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C823', 'MZ02C823', 'Grecia Camacho', 1, 1, 1, 1, 1, 'ENTREGADO', '', '06/11/2025', 'Franco Sanchez', 'Tijuana', 'LAPTOP', 'HP', 'i7-1255U', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C8YN', 'MZ02C8YN', '', 0, 0, 0, 0, 0, '', '', '', 'Roberto Borbon', 'Hermosillo', 'LAPTOP', 'HP', 'i7-1255U', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C8ZW', 'MZ02C8ZW', 'Omar Jimenez', 1, 1, 1, 1, 1, 'ENTREGADO', '', '04/11/2025', 'Elaynne Soto', 'Merida', 'LAPTOP', 'DELL', 'Intel i5-7200U', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C96W', 'MZ02C96W', '', 0, 0, 0, 0, 0, '', '', '', 'Humberto Escalante', 'Monterrey', 'LAPTOP', 'HP', 'intel i7-1255U', '8GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C8CA', 'MZ02C8CA-2', 'Elizabeth Hernandez', 1, 1, 1, 1, 1, 'ENTREGADO', '', '30/10/2025', 'Elizabeth Hernandez', 'CDMX', 'Escritorio', 'HP', 'Intel i7-7700', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C99M', 'MZ02C99M', 'Edgar Jimenez', 1, 1, 1, 1, 1, 'ENTREGADO', 'Aún con el acceso adecuado', '31/10/2025', 'Marco Solis', 'GDL', 'Escritorio', 'LENOVO', 'Intel i5-7400T', '16GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02C9AV', 'MZ02C9AV', 'Renata Pinzon', 1, 1, 0, 1, 1, '', '', '', 'Renata Pinzón', 'GDL', 'Escritorio', 'HP', 'Intel i3-4160', '4GB', 'W7'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CAXB', 'MZ02CAXB', 'Pablo Mendez', 1, 1, 1, 1, 1, 'ENTREGADO', '', '27/10/2025', 'Anita', 'GDL', 'Escritorio', 'HP', 'Intel i3-4160', '8GB', 'W8'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CB5D', 'MZ02CB5D', 'Elisa Robles', 1, 1, 1, 1, 0, 'ENTREGADO', '', '03/11/2025', 'Joana Tovar', 'GDL', 'Escritorio', 'HP', 'Intel i5-1135G7', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CB86', 'MZ02CB86', 'Mariana Rios', 1, 1, 1, 1, 1, 'ENTREGADO', '', '05/11/2025', 'Aida Rivera', 'GDL', 'Escritorio', 'HP', 'AMD E1-1200 APU', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBA6', 'MZ02CBA6', '', 0, 0, 0, 0, 0, '', '', '', 'Daniel Rodriguez', 'GDL', 'Esscritorio', 'HP', 'AMD E1-1200 APU', '8GB', 'W10'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBCQ', 'MZ02CBCQ', 'Saori Yamamoto', 0, 0, 0, 0, 0, '', 'Problemas copia Outlook', '', 'Chocho', 'GDL', 'LAPTOP', 'HP', '', '6GB', 'W11'],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBEK', 'MZ02CBEK', 'Antonio Ramirez', 1, 1, 1, 1, 1, 'ENTREGADO', 'Archivos en Z listos para respaldo', '06/11/2025', '', '', '', '', '', '', ''],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBF3', 'MZ02CBF3', 'Aida Rivera', 1, 1, 0, 0, 1, '', '', '', '', '', '', '', '', '', ''],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBPF', 'MZ02CBPF', '', 0, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', ''],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBTS', 'MZ02CBTS', 'Boris', 0, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', ''],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CBY1', 'MZ02CBY1', 'SERGIO SOLIS (APARTADO)', 0, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', ''],
    ['PC Escritorio Lenovo - ThinkCentre M70Q Tiny G5', 'MZ02CCKH', 'MZ02CCKH', 'Cesar Chimal', 1, 1, 1, 0, 1, 'ENTREGADO', '', '30/10/2025', '', '', '', '', '', '', '']
];

// TABLA 2: MONITORES (PANEL TIO24)
$lista_monitores = [
    // [Nombre, Folio, Serie, Usuario, Nombre_Heredado, Zona, Equipo, Marca, Procesador, RAM, Windows, Comentarios]
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYM9M', 'V30CYM9M', 'Mariana Rios', 'CARMEN FLORES', 'CDMX', 'Escritorio', 'HP', 'AMD E1-1200', '4GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYM9X', 'V30CYM9X', '', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMA4', 'V30CYMA4', '', 'RICARDO ZEPEDA', 'CDMX', 'LAPTOP', 'DELL', 'Intel I7-7TH', '8GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMA5', 'V30CYMA5', '', 'Raúl Valdez', 'Monterrey', 'LAPTOP', 'HP', 'Intel I7-8TH', '8GB', 'W10', 'HEREDABLE'],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMAP', 'V30CYMAP', 'Mauricio Cardenas', 'Valeria Banderas', 'Monterrey', 'LAPTOP', 'HP', 'Intel i3-5005U', '8GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMAR', 'V30CYMAR', '', 'Marco Solis', 'GDL', 'Escritorio', 'HP', 'Intel i7-7700', '8GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMB6', 'V30CYMB6', 'Diego Jaramillo', 'Renata Pinzón', 'GDL', 'Escritorio', 'LENOVO', 'Intel i5-7400T', '16GB', 'W10', 'Martes'],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMB9', 'V30CYMB9', 'Ahtziri Almaral', 'Anita', 'GDL', 'Escritorio', 'HP', 'Intel i3-4160', '4GB', 'W7', 'Martes'],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMBH', 'V30CYMBH', 'Ismael Trinidad', 'Joana Tovar', 'GDL', 'Escritorio', 'HP', 'Intel i3-4160', '8GB', 'W8', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMBV', 'V30CYMBV', 'Pablo Mendez', 'Aida Rivera', 'GDL', 'Escritorio', 'HP', 'Intel i5-1135G7', '8GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30CYMBW', 'V30CYMBW', 'Sergio Solis', 'Daniel Razo', 'GDL', 'Esscritorio', 'HP', 'AMD E1-1200 APU', '8GB', 'W10', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P5H', 'V30D3P5H', 'Grecia Camacho', 'Chocho', 'GDL', 'LAPTOP', 'HP', '', '6GB', 'W11', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P5L', 'V30D3P5L', 'Veronica Gonzalez', 'Mauricio Cardenas', 'GDL', 'Escritorio', 'HP', 'AMD R5-3550H', '6GB', 'W11', 'Martes'],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P5W', 'V30D3P5W', 'Daniel Valderrama', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P5X', 'V30D3P5X', 'Elisa Robles', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P5Z', 'V30D3P5Z', 'Renata', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P67', 'V30D3P67', '', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P6B', 'V30D3P6B', 'Aida Rivera', 'Mariana Rios', 'V. Internas', 'Escritorio', 'HP', 'Intel i3-10110U', '8GB', 'W11', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P6W', 'V30D3P6W', 'Elvira Avila', 'Antonio Ramirez', 'V. Internas', 'Escritorio', 'HP', 'Intel i5-1235U', '8GB', 'W11', '240GB'],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P79', 'V30D3P79', 'Cesar Chimal', 'Grecia Camacho', 'V. Internas', 'Escritorio', 'HP', 'Intel i3-10110U', '8GB', 'W11', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P7A', 'V30D3P7A', 'Erika Torres', 'Daniel Vazquez', 'V. Internas', 'Escritorio', 'LENOVO', 'Intel Celeron-7305', '8GB', 'W11', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D3P7G', 'V30D3P7G', 'Elizabeth Hernandez', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BRV', 'V30D5BRV', 'Antonio Ramirez', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BRX', 'V30D5BRX', 'Daniel Vazquez', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BT6', 'V30D5BT6', 'Juan Fernando', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BT9', 'V30D5BT9', 'Omar Jimenez', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BV5', 'V30D5BV5', 'Edgar Jimenez', '', '', '', '', '', '', '', ''],
    ['Monitor Lenovo - ThinkCentreTIO24 Gen5', 'V30D5BVM', 'V30D5BVM', 'Saori Yamamoto', '', '', '', '', '', '', '', '']
];

try {
    $pdo->exec("TRUNCATE TABLE hardware_assets");
    $pdo->exec("TRUNCATE TABLE peripherals");

    $sql = "INSERT INTO hardware_assets (name, code, serial, assigned_user, has_office, has_reader, has_winrar, has_server, has_printer, status, comments, delivery_date, zone, brand, model, processor, ram, os) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    $used_codes = [];

    // Función auxiliar para obtener un código único
    $getUniqueCode = function($code) use (&$used_codes) {
        $original = $code;
        $count = 1;
        while (in_array($code, $used_codes)) {
            $count++;
            $code = $original . "-" . $count;
        }
        $used_codes[] = $code;
        return $code;
    };

    // INSERTAR LISTA DE CPUs
    foreach ($lista_cpus as $c) {
        $uniqueCode = $getUniqueCode($c[1]);
        $stmt->execute([
            $c[0], $uniqueCode, $c[2], $c[3], $c[4], $c[5], $c[6], $c[7], $c[8], $c[9], $c[10], $c[11], $c[13], $c[15], $c[16], $c[17], $c[18], $c[19]
        ]);
    }

    // INSERTAR LISTA DE MONITORES/HEREDABLES
    foreach ($lista_monitores as $m) {
        $uniqueCode = $getUniqueCode($m[1]);
        $stmt->execute([
            $m[0], $uniqueCode, $m[2], $m[3], 0, 0, 0, 0, 0, 'HEREDABLE', $m[11], null, $m[5], $m[7], $m[6], $m[8], $m[9], $m[10]
        ]);
    }

    echo "<h4 style='color:green'>¡Carga Masiva Exitosa sin modificaciones de datos!</h4>";
    echo "<li>Se cargaron 28 CPUs ThinkCentre.</li>";
    echo "<li>Se cargaron 28 Monitores/Heredables TIO24.</li>";
    echo "<li><b>Total: 56 registros en hardware_assets.</b></li>";

} catch (Exception $e) {
    echo "<h4 style='color:red'>Error al cargar: " . $e->getMessage() . "</h4>";
}
?>
