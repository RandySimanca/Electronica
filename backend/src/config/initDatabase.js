// backend/src/config/initDatabase.js - VERSIÓN ACTUALIZADA
import mysql from "mysql2/promise";
import { config } from "./env.js";

const initDatabase = async () => {
  try {
    // Primero, crear la base de datos si no existe
    const tempPool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    const tempConn = await tempPool.getConnection();
    await tempConn.execute(`CREATE DATABASE IF NOT EXISTS ${config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    tempConn.release();
    await tempPool.end();

    // Ahora crear pool con la base de datos
    const pool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const conn = await pool.getConnection();

    // Crear tablas
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        contraseña VARCHAR(255) NOT NULL,
        rol ENUM('admin','vendedor','tecnico') NOT NULL,
        section ENUM('electronica','sistemas','celulares') NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      INSERT INTO usuarios (nombre, email, contraseña, rol, active)
      VALUES ('admin', 'admin@store.com', '$2a$10$nnrHhIuuwawhk2pJ/3oKguFPl8Km.frmRLQLkSqY1lifkVb1vI/Ou', 'admin', TRUE)
      ON DUPLICATE KEY UPDATE nombre=nombre
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        doc VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de ventas actualizada con campos del cliente
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        payment_method ENUM('efectivo','tarjeta','transferencia') NOT NULL,
        customer_name VARCHAR(100) DEFAULT 'Cliente General',
        customer_doc VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla items_venta actualizada con nombre del producto
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS items_venta (
        id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(100) NULL,
  FOREIGN KEY (sale_id) REFERENCES ventas(id),
  FOREIGN KEY (product_id) REFERENCES productos(id)
      )
    `);
  

    // Migración: Agregar columnas si no existen
    try {
      await conn.execute(`
        ALTER TABLE ventas 
        ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100) DEFAULT 'Cliente General',
        ADD COLUMN IF NOT EXISTS customer_doc VARCHAR(50) NULL
      `);
      console.log("✅ Columnas customer_name y customer_doc agregadas a ventas");
    } catch (error) {
      // Si falla, intentar agregar una por una (MySQL no soporta IF NOT EXISTS en ALTER)
      try {
        await conn.execute(`ALTER TABLE ventas ADD COLUMN customer_name VARCHAR(100) DEFAULT 'Cliente General'`);
      } catch (e) {
        console.log("ℹ️ Columna customer_name ya existe");
      }
      
      try {
        await conn.execute(`ALTER TABLE ventas ADD COLUMN customer_doc VARCHAR(50) NULL`);
      } catch (e) {
        console.log("ℹ️ Columna customer_doc ya existe");
      }
    }

    try {
      await conn.execute(`
        ALTER TABLE items_venta 
        ADD COLUMN IF NOT EXISTS product_name VARCHAR(100) NULL
      `);
      console.log("✅ Columna product_name agregada a items_venta");
    } catch (error) {
      try {
        await conn.execute(`ALTER TABLE items_venta ADD COLUMN product_name VARCHAR(100) NULL`);
      } catch (e) {
        console.log("ℹ️ Columna product_name ya existe");
      }
    }

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reparaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        device VARCHAR(100) NOT NULL,
        issue_description TEXT NOT NULL,
        section ENUM('electronica','sistemas','celulares') NOT NULL,
        status ENUM('pendiente','en_proceso','completada') DEFAULT 'pendiente',
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL,
        FOREIGN KEY (client_id) REFERENCES clientes(id),
        FOREIGN KEY (assigned_to) REFERENCES usuarios(id)
      )
    `);
    

    conn.release();
    console.log("✅ Tablas inicializadas correctamente en 'electronica_store'");

    return pool;
  } catch (error) {
    console.error("❌ Error al inicializar las tablas:", error);
    throw error;
  }
};

export default initDatabase;