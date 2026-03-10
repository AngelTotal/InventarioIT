-- Tablas del Sistema de Inventario IT Total Ground
-- Generado el: 2026-02-03

CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

-- 1. Usuarios del Sistema
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'consulta') DEFAULT 'consulta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Directorio de Empleados (Para asignaciones centralizadas)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    email_corporate VARCHAR(100),
    extension VARCHAR(10),
    status ENUM('Activo', 'Inactivo') DEFAULT 'Activo'
);

-- 3. Equipos de Cómputo (Laptops, Desktops, Servidores)
CREATE TABLE IF NOT EXISTS hardware_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(100),
    serial VARCHAR(100),
    processor VARCHAR(100),
    ram VARCHAR(20),
    storage VARCHAR(50),
    os VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Disponible',
    location VARCHAR(100),
    zone VARCHAR(50),
    has_office BOOLEAN DEFAULT 0,
    has_winrar BOOLEAN DEFAULT 0,
    has_pdf_reader BOOLEAN DEFAULT 0,
    delivery_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Periféricos (Mouse, Teclado, Monitor, etc.)
CREATE TABLE IF NOT EXISTS peripherals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(100),
    serial VARCHAR(100),
    category VARCHAR(50), -- Monitor, Kit Mouse/Teclado, Cargador, etc.
    status VARCHAR(50) DEFAULT 'Disponible',
    location VARCHAR(100),
    quantity INT DEFAULT 1,
    comments TEXT
);

-- 5. Celulares y Equipos Móviles
CREATE TABLE IF NOT EXISTS cellphones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- Relación opcional con catálogo de empleados
    employee_name_legacy VARCHAR(150), -- Para mantener data actual
    model VARCHAR(100),
    area VARCHAR(100),
    email_account VARCHAR(100), -- Gmail/Office vinculado al cel
    recovery_account VARCHAR(100),
    phone_number VARCHAR(20),
    password VARCHAR(100),
    updated_password VARCHAR(100),
    birth_date VARCHAR(50),
    app_lock_password VARCHAR(100),
    app_lock_answer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'En Uso',
    update_note TEXT,
    comments TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 6. Insumos de Impresión (Tintas, Toners)
CREATE TABLE IF NOT EXISTS printer_supplies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50),
    model VARCHAR(100),
    color VARCHAR(20),
    type VARCHAR(50), -- Tinta, Toner, Cinta
    capacity VARCHAR(50),
    quantity INT DEFAULT 0,
    purchase_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'Disponible',
    comments TEXT
);

-- 7. Licencias de Software y Credenciales
CREATE TABLE IF NOT EXISTS licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- Software, Servicio Web, Antivirus
    key_value TEXT,
    password VARCHAR(255),
    expiration_date DATE,
    status VARCHAR(50),
    vendor VARCHAR(100),
    link TEXT,
    comments TEXT
);

-- 8. Cuentas de Correo y Accesos
CREATE TABLE IF NOT EXISTS account_management (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255),
    account_type ENUM('Microsoft 365', 'Gmail', 'Hospedaje', 'Personal') NOT NULL,
    assigned_to VARCHAR(150),
    employee_id INT,
    status VARCHAR(50) DEFAULT 'Activo',
    comments TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 9. Dispositivos de Red (Nodos)
CREATE TABLE IF NOT EXISTS network_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50), -- Switch, AP, Router, Firewall
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    location VARCHAR(100),
    brand VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Activo'
);

-- 10. Configuraciones de Red
CREATE TABLE IF NOT EXISTS enterprise_networks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    network_name VARCHAR(100) NOT NULL,
    vlan VARCHAR(10),
    gateway VARCHAR(45),
    password VARCHAR(100),
    encryption VARCHAR(50),
    comments TEXT
);

-- 11. Calendario de Recordatorios (Migración de LocalStorage a DB)
CREATE TABLE IF NOT EXISTS calendar_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_done BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tutoriales y Documentación
CREATE TABLE IF NOT EXISTS tutorials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content_url TEXT, -- Link a PDF o video
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Catálogo de Archivos FTP
CREATE TABLE IF NOT EXISTS ftp_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    alias_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 14. Historial de Asignaciones (Relacional)
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    asset_type ENUM('Hardware', 'Peripheral', 'Cellphone') NOT NULL,
    asset_id INT NOT NULL,
    date_assigned DATE NOT NULL,
    date_returned DATE,
    condition_on_assign VARCHAR(50),
    condition_on_return VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
-- 15. Respaldos de Correo
CREATE TABLE IF NOT EXISTS email_backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(100),
    original_email VARCHAR(150),
    backup_name VARCHAR(100),
    backup_email VARCHAR(150),
    start_date DATE,
    end_date DATE,
    is_done BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
