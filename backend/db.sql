-- Base de datos: it_inventory

CREATE DATABASE IF NOT EXISTS it_inventory;
USE it_inventory;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  role ENUM('admin', 'sistemas', 'consulta') DEFAULT 'consulta',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario Admin por defecto (Password: admin)
INSERT INTO users (username, password, fullname, role, avatar) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador TI', 'admin', 'https://ui-avatars.com/api/?name=Admin+TI&background=3b82f6&color=fff')
ON DUPLICATE KEY UPDATE id=id;

-- Tabla de Inventario
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  brand VARCHAR(50),
  model VARCHAR(50),
  serial VARCHAR(100),
  status ENUM('Disponible', 'En Uso', 'Mantenimiento', 'Baja') DEFAULT 'Disponible',
  location VARCHAR(100),
  specs TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos dummy Inventario
INSERT INTO inventory (code, name, category, brand, serial, status, location) VALUES 
('INV-001', 'MacBook Pro 14 M1', 'Computadoras', 'Apple', 'C02XYZ123', 'Disponible', 'Almacén Central'),
('INV-002', 'Dell Latitude 5420', 'Computadoras', 'Dell', '8H2K92', 'En Uso', 'Oficina 101'),
('INV-003', 'Monitor Dell 27 4K', 'Periféricos', 'Dell', 'CN-0X-123', 'Disponible', 'Almacén Central');


-- Tabla de Asignaciones (En Uso)
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inventory_id INT,
  assigned_to VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  date_assigned DATE DEFAULT (CURRENT_DATE),
  notes TEXT,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL
);

INSERT INTO assignments (inventory_id, assigned_to, department, notes) VALUES
(2, 'Juan Perez', 'Desarrollo', 'Equipo principal');


-- Tabla de Licencias y Credenciales
CREATE TABLE IF NOT EXISTS licenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('Licencia', 'Credencial') NOT NULL,
  key_value VARCHAR(255), -- Encriptar en backend real
  vendor VARCHAR(50),
  expiration_date DATE,
  quantity INT DEFAULT 1,
  used INT DEFAULT 0,
  details TEXT 
);

INSERT INTO licenses (name, type, vendor, expiration_date, details) VALUES
('Office 365 E3', 'Licencia', 'Microsoft', '2026-12-31', 'Licencia anual corporativa'),
('Adobe Creative Cloud', 'Licencia', 'Adobe', '2026-05-15', 'Equipo de Diseño');


-- Tabla de Red
CREATE TABLE IF NOT EXISTS network_devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  mac_address VARCHAR(17),
  type ENUM('Router', 'Switch', 'AP', 'Server', 'Firewall') NOT NULL,
  location VARCHAR(100),
  status ENUM('Online', 'Offline', 'Mantenimiento') DEFAULT 'Online'
);

INSERT INTO network_devices (name, ip_address, type, location) VALUES 
('Core Switch L3', '192.168.1.1', 'Switch', 'Site Principal'),
('Firewall FortiGate', '192.168.1.254', 'Firewall', 'Site Principal');


-- Tabla de Tutoriales
CREATE TABLE IF NOT EXISTS tutorials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  file_url VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tutorials (title, description, category, file_url) VALUES
('Configuración VPN', 'Guía para configurar VPN en Windows 11', 'Redes', '#');
