// backend/src/config/initDatabase.js
import mysql from "mysql2/promise";
import { config } from "./env.js";

const initDatabase = async () => {
  try {
    // Detectar si estamos en producción (Heroku/JawsDB)
    const isProduction = process.env.JAWSDB_URL || process.env.NODE_ENV === "production";

    let pool;

    if (!isProduction) {
      // 🔹 Modo LOCAL: crear la DB si no existe
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
      await tempConn.execute(
        `CREATE DATABASE IF NOT EXISTS ${config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      tempConn.release();
      await tempPool.end();

      // Conectar al pool con base incluida
      pool = mysql.createPool({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        port: config.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } else {
      // 🔹 Modo PRODUCCIÓN: usar JawsDB directamente
      pool = mysql.createPool({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
        port: config.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }

    const conn = await pool.getConnection();

    // ✅ Aquí ya puedes crear tablas si no existen (esto sí está permitido en JawsDB)
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

    // Insertar admin por defecto
    await conn.execute(`
      INSERT INTO usuarios (nombre, email, contraseña, rol, active)
      VALUES ('admin', 'admin@store.com', '$2a$10$nnrHhIuuwawhk2pJ/3oKguFPl8Km.frmRLQLkSqY1lifkVb1vI/Ou', 'admin', TRUE)
      ON DUPLICATE KEY UPDATE nombre=nombre
    `);

    // Resto de tus tablas...
    // clientes, productos, ventas, items_venta, reparaciones

    conn.release();
    console.log(`✅ Tablas inicializadas correctamente en '${config.DB_NAME}'`);

    return pool;
  } catch (error) {
    console.error("❌ Error al inicializar las tablas:", error.message);
    throw error;
  }
};

export default initDatabase;
