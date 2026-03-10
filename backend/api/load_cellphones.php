<?php
require_once 'config.php';

if (!isConnected()) {
    die("Error: No hay conexión a la base de datos.");
}

echo "<h3>Cargando Datos de Celulares...</h3>";

$cellphones = [
    ['YANSI SANCHEZ', 'Xiaomi Redmi 9A', 'Ventas Exportacion', 'yansi.sanchez23@gmail.com', 'Lo tiene Mayra/ lo tiene elka', 'marielena@totalground.com', '', 'Ground2021.*t'],
    ['ANTONIO RAMIREZ', 'Xiaomi Redmi 9A', 'Ventas Internas', 'antonio.ramirez23@gmail.com', '', 'marielena@totalground.com', '3322297435', 'Ground2021.*t'],
    ['CESAR CHIMAL', 'Xiaomi Redmi 9A', 'Ventas Internas', 'cesar.chimal23@gmail.com', '', 'marielena@totalground.com', '3323397451', 'Ground2021.*t'],
    ['YANET RODRIGUEZ', 'Xiaomi Redmi 9A', 'Ventas Internas', 'yanet.rodriguez23@gmail.com', '', 'marielena@totalground.com', '3323397451', 'Ground2021.*t'],
    ['EDGAR JIMENEZ', 'Xiaomi Redmi 9A', 'Ventas Internas', 'edgar.jimenez23@gmail.com', '', 'marielena@totalground.com', '3323397461', 'Ground2021.*t'],
    ['ELISA ROBLES', 'Xiaomi Redmi 9A', 'Ventas Internas', 'elisa.robles23@gmail.com', 'Lo tiene jose rojas', 'marielena@totalground.com', '3323397443', 'Ground2021.*t'],
    ['ELIZABETH HERNANDEZ', 'Xiaomi Redmi 9A', 'Ventas Internas', 'elizabeth.hernandez23@gmail.com', 'Lo tiene Alondra', 'marielena@totalground.com', '3323397432', 'Ground2021.*t'],
    ['ALEJANDRO ESTRADA', 'Xiaomi Redmi 9A', 'Ventas Internas', 'alejandro.estrada23@gmail.com', 'Lo tiene Archivi', 'marielena@totalground.com', '3323397446', 'Ground2021.*t'],
    ['LLENES LORETO', 'Xiaomi Redmi 9A', 'Ventas Internas', 'llenes.loreto23@gmail.com', '', 'marielena@totalground.com', '3323397438', 'Ground2021.*t'],
    ['MARIANA RIOS', 'Xiaomi Redmi 9A', 'Ventas Internas', 'mariana.rios23@gmail.com', '', 'marielena@totalground.com', '3323397433', 'Ground2021.*t'],
    ['ANGELICA REGINO', 'Xiaomi Redmi 9A', 'Ventas Internas', 'angelica.regino23@gmail.com', 'Lo tiene Seoni', 'marielena@totalground.com', '3323397445', 'Ground2021.*t'],
    ['GABRIELA MEJIA', 'Motorola G plus', 'Merca', 'gabriela.mejia23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2021.*t'],
    ['GRECIA CAMACHO', 'Xiaomi Redmi 9A', 'Ventas Internas', 'grecia.camacho23@gmail.com', '', 'marielena@totalground.com', '3323397451', 'Ground2021.*t'],
    ['VALERIA SANDOVAL', 'Xiaomi Redmi 9A', 'Ventas Internas', 'valeria.sandoval23@gmail.com', 'Lo tenia Reysil', 'marielena@totalground.com', '', 'Ground2021.*t'],
    ['BRENDA GONZALEZ', 'Xiaomi Redmi 9A', 'Ventas Internas', 'brenda.gonzalez23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2021.*t'],
    ['VENTAS', 'Motorola G plus', 'Pag. web total', 'totalground23@gmail.com', 'Lo tiene alondra', 'marielena@totalground.com', '3333332912', 'Ground2021.*t'],
    ['MARYELY VASQUEZ', 'Motorola G plus', 'Gerencia Exportacion', 'maryely.vasquezg@gmail.com', 'Lo Tiene Mayra / lo tiene Maria', 'marielena@totalground.com', '3333330386', 'Ground2022.*t', 'SISTERMA2023*t'],
    ['GEMA VALDEZ', 'Samsung', 'EXTERNA HERMOSILLO', 'gema.valdezg23@gmail.com', 'cambio de equipo', 'marielena@totalground.com', '', 'Ground2022.*t'],
    ['VICENTE RAMIREZ', 'Xiaomi Redmi 9A', 'Externo GDL', 'vicente.ramirez23@gmail.com', 'Se le cambio por un iphone', 'marielena@totalground.com', '', 'Ground2022.*t'],
    ['ALONDRA FUENTES', 'iPhone', 'Ventas Internas', 'alondra.fuentes@totalground.com', '', '', '3323356020', 'Ground2022.*t'],
    ['ALEXIS HERNANDEZ', 'Samsung', 'Externo CDMX', 'alexis.herndz23@gmail.com', '', '', '', 'Ground2023.h'],
    ['LUIS CARLOS', 'Xiaomi Redmi 9A', 'Externo', 'soytelemata23@gmail.com', 'Lo tiene Juan Carlos Hernandez', '', '', 'Ground2023.h'],
    ['ALEXIS CASTAÑEDA', 'Xiaomi Redmi 9A', 'Externo CDMX', 'alexis.castaneda23@gmail.com', 'cambio de equipo / JUAN ZAMORES', 'marielena@totalground.com', '', 'Ground2023.*t'],
    ['OSVALDO FLORES', 'Samsung Galaxy A10', 'Proyectos', 'osvaldo.flores23@gmail.com', 'cambio de equipo', 'marielena@totalground.com', '', 'Ground2022.*t'],
    ['ROSA MARTINEZ', 'Xiaomi Redmi 9A', '', 'rosamartinez23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2023.*t'],
    ['BEYSSI GUZMAN', 'Xiaomi Redmi 9A', 'Merca', 'beyssi.mkt@gmail.com', '', 'marielena@totalground.com', '', 'GROUND2021.*t.h'],
    ['JOSE ROJAS', 'Xiaomi Redmi 9A', 'Ventas Internas', 'jose.rojas.tg12@gmail.com', '', 'marielena@totalground.com', '', 'GROUND2021'],
    ['DIEGO RODRIGUEZ', 'OPPO RENO7', 'Externo Monterrey', 'diego.rodriguez23@gmail.com', 'SE USARA RESPALDO DE LA PC', 'marielena@totalground.com', '', 'GROUND2021.h', '', '02-jun-95'],
    ['FLAYNNE SOTO', 'OPPO RENO7', 'Externo Merida', 'ets.tg@gmail.com', '', 'marielena@totalground.com', '', 'Generatoc01', '', '', 'Ground2023.h', 'Total Ground'],
    ['ROMAN PEREZ', 'OPPO RENO7', 'Externo GDL', 'tg.andru@gmail.com', 'se le dio a Juan Zamores / CESAR JIMENEZ', 'marielena@totalground.com', '', 'Generatoc01', 'Ground2023.h', '01-ene-00', 'Ground2023.h', 'Sergio Solis'],
    ['VICTOR GOMEZ', 'OPPO RENO7', 'Externo CDMX', 'victorgomez23@gmail.com', '', 'marielena@totalground.com', '', 'Generatoc01', 'Ground2023.h', '15-jun-88', 'Ground2023.h', 'Sergio Solis'],
    ['IRVING VALLADARES', 'OPPO RENO7', 'Externo CDMX', 'valladares.totalground@gmail.com', '', 'marielena@totalground.com', '', 'Generatoc01', 'Ground2023.h', '', 'Ground2023.h', 'Sergio Solis'],
    ['ALEXIS CASTAÑEDA', 'OPPO RENO7', 'Externo CDMX', 'alexis.castaneda23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2023.*t', '', '', 'Ground2023.h', 'Sergio Solis'],
    ['GEMA VALDEZ', 'OPPO RENO7', 'Externa Hermosillo', 'gema.valdezg23@gmail.com', 'se le dio a Roberto Figueroa', 'marielena@totalground.com', '', 'Ground2022.*t', '', '', 'Ground2023.h', 'Tiene patron de desbloqueo', 'Ground2024.h'],
    ['PEDRO ABDON', 'OPPO RENO7', 'Externo GDL', 'pedro.abdon.totalground@gmail.com', '', 'marielena@totalground.com', '', 'Ground2021', '', '', '', 'Tiene patron de desbloqueo'],
    ['OSVALDO FLORES', 'OPPO RENO7', 'Externo CDMX', 'osvaldo.flores23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2023.*t', '', '', '', 'Tiene patron de desbloqueo'],
    ['JUAN CARLOS', 'OPPO RENO7', 'Externo GDL', 'soytelemata23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2022.*t', '', '', '', 'Tiene patron de desbloqueo'],
    ['Elvira', 'OPPO RENO7', 'Compras', 'elvira.arista23@gmail.com', 'cambio de equipo', 'marielena@totalground.com', '', 'Ground2024.*t.h', 'antes 010187', '30-jun-95', '', 'Tiene patron de desbloqueo', 'Sergio Solis'],
    ['Annay Luna', 'Redmi Note 11', 'MERKA', 'merka.totalground23@gmail.com', 'cambio de cuenta, tenia todo a nombre de Valeria', 'marielena@totalground.com', '', 'Ground2023.h', '', '04-jul-94', '', 'Tiene patron de desbloqueo', 'Sergio Solis', '15/06/2023'],
    ['Raúl Salazar', 'Xiaomi Redmi 9A', 'Externo GDL', 'raul.salazar.tg23@gmail.com', 'Equipo Nuevo', 'marielena@totalground.com', '', 'Ground2023.h', '', '16-jul-80'],
    ['Mario Amezcua', 'Motorola G plus', 'Exportacion', 'mario.amezcua23@gmail.com', 'era de maryely', 'marielena@totalground.com', '', 'Ground2023.h', '', '13/08/1994'],
    ['Jaime Inuegas', 'Xiaomi Redmi 9A', 'Externo CDMX', 'jaime.inuegas.tg23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2023.h', '', '23/07/1995'],
    ['Roberto Figueroa', 'OPPO RENO7', 'Externo Hermosillo', 'roberto.figueroa.tg23@gmail.com', 'era de Gema Valdez', 'marielena@totalground.com', '', 'Ground2023.h', '', '02/11/1999'],
    ['Michelle Diaz', 'Xiaomi Redmi 9A', 'MERCADOTECNIA', 'michi.diaz23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2023.h', '', '25/08/1948'],
    ['ALEXIS CASTAÑEDA', 'Xiaomi Redmi 9A', 'Externo GDL', 'castanedaalexis23@gmail.com', 'era de Sebastian, se le asigno por el cambio de cdmx a gdl', '', '', 'Ground2024.h.*t', '', '27/08/1993'],
    ['LUIS GONZALEZ', '', '', 'luis.gonzaleztg23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2024.h.*t'],
    ['Victor Garcia', 'Iphone 7', 'Compras', 'victor.garciatg23@gmail.com', '', 'marielena@totalground.com', '', 'Ground2024.*t', '19/12/1987'],
    ['JUAN CARLOS', 'LENOVO YOGA', 'EXTERNO GDL', 'juan.hernandez24@gmail.com', '', 'marielena@totalground.com', '', 'Ground2024.h.*t', '', '13 ene-97'],
    ['JESUS CARDENAS', 'DELL', 'EXTERNO LEON', 'jesus.cardenastg24@gmail.com', '', 'marielena@totalground.com', '', 'Ground2024. h.*t', '', '21/02/1996'],
    ['PEDRO MENDOZA LAP', 'HP', 'EXTERNO GDL', 'pedro.mendoza.tg24@gmail.com', '', 'marielena@totalground.com', '', 'Ground2024. h.*t', '', '24/06/1945']
];

try {
    $pdo->exec("TRUNCATE TABLE cellphones");
    
    $sql = "INSERT INTO cellphones (employee_name_legacy, model, area, email_account, comments, recovery_account, phone_number, password, updated_password, birth_date, app_lock_password, app_lock_answer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    foreach ($cellphones as $c) {
        $stmt->execute([
            $c[0] ?? null, // Empleado
            $c[1] ?? null, // Modelo
            $c[2] ?? null, // Area
            $c[3] ?? null, // Correo
            $c[4] ?? null, // Comentarios
            $c[5] ?? null, // Recuperacion
            $c[6] ?? null, // Telefono
            $c[7] ?? null, // Password
            $c[8] ?? null, // Password Actualizada
            $c[9] ?? null, // Nacimiento
            $c[10] ?? null, // Bloqueo Apps
            $c[11] ?? null  // Respuesta Seguridad
        ]);
    }

    echo "<h4 style='color:green'>¡Datos cargados exitosamente! (" . count($cellphones) . " registros)</h4>";
} catch (Exception $e) {
    echo "<h4 style='color:red'>Error al cargar datos: " . $e->getMessage() . "</h4>";
}
?>
