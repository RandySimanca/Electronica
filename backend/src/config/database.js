
import mysql from 'mysql2/promise';
import { config } from './env.js';

// Configuración del pool de conexiones
const poolConfig = {
  host: config.DB.host,
  port: config.DB.port,
  user: config.DB.user,
  password: config.DB.password,
  database: config.DB.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(poolConfig);

// Verificar conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a base de datos establecida');
    console.log(`   Host: ${config.DB.host}`);
    console.log(`   Database: ${config.DB.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    throw error;
  }
};

// Función helper para ejecutar queries
export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

// Cerrar el pool cuando la aplicación se cierre
export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar pool:', error.message);
  }
};

export default pool;