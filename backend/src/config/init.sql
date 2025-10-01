-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS electronica_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE electronica_store;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  rol ENUM('admin','vendedor','tecnico') NOT NULL,
  section ENUM('electronica','sistemas','celulares') NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin (contraseña: admin)
-- Contraseña está encriptada con bcrypt (cost=10)
INSERT INTO usuarios (nombre, email, contraseña, rol, active)
VALUES ('admin', 'admin@store.com', '$2a$10$nnrHhIuuwawhk2pJ/3oKguFPl8Km.frmRLQLkSqY1lifkVb1vI/Ou', 'admin', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method ENUM('efectivo','tarjeta','transferencia') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

-- Items de cada venta
CREATE TABLE IF NOT EXISTS items_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES ventas(id),
  FOREIGN KEY (product_id) REFERENCES productos(id)
);

-- Tabla de reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  device VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  section ENUM('electronica','sistemas','celulares') NOT NULL,
  status ENUM('recibido','en_revision','en_reparacion','reparado','entregado','no_reparable') DEFAULT 'recibido',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (client_id) REFERENCES clientes(id)
);
