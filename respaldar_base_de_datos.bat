@echo off
setlocal enabledelayedexpansion

:: --- CONFIGURACIÓN ---
:: Ruta a la carpeta bin de MySQL de XAMPP
set "MYSQL_BIN=C:\xampp\mysql\bin"
:: Carpeta donde se guardarán los respaldos
set "BACKUP_DIR=C:\xampp\htdocs\inventario\db_backups"
:: Usuario de la base de datos (por defecto root)
set "DB_USER=root"
:: Contraseña (dejar vacío si no tiene)
set "DB_PASS="
:: ---------------------

:: Crear carpeta de backups si no existe
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Carpeta de respaldos creada en %BACKUP_DIR%
)

:: Obtener fecha y hora para el nombre del archivo (Formato: YYYY-MM-DD_HH-MM)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set "TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%"
set "FILENAME=full_backup_%TIMESTAMP%.sql"

echo ==========================================
echo    RESPALDO AUTOMATICO DE BASES DE DATOS
echo ==========================================
echo Fecha: %DATE% %TIME%
echo Guardando en: %BACKUP_DIR%\%FILENAME%
echo.

:: Ejecutar el volcado de TODAS las bases de datos (incluye inventario, total_ground, etc.)
if "%DB_PASS%"=="" (
    "%MYSQL_BIN%\mysqldump.exe" --user=%DB_USER% --all-databases --result-file="%BACKUP_DIR%\%FILENAME%"
) else (
    "%MYSQL_BIN%\mysqldump.exe" --user=%DB_USER% --password=%DB_PASS% --all-databases --result-file="%BACKUP_DIR%\%FILENAME%"
)

:: Verificar si el comando fue exitoso
if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] El respaldo se genero correctamente.
    
    :: Limpieza: Borrar respaldos con mas de 7 dias de antiguedad para no llenar el disco
    echo Limpiando archivos antiguos...
    forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -7 /c "cmd /c del @path" 2>nul
    echo.
    echo Proceso terminado exitosamente.
) else (
    echo.
    echo [ERROR] Hubo un problema al generar el respaldo.
    echo Verifica que MySQL este encendido en XAMPP.
    echo.
    pause
)

timeout /t 5
endlocal
