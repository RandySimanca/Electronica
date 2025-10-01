import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

// Parsear JAWSDB_URL si existe (para Heroku)
const parseJawsDBUrl = (url) => {
  if (!url) return null;
  
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1)
    };
  } catch (error) {
    console.error('Error parseando JAWSDB_URL:', error);
    return null;
  }
};

const jawsDB = parseJawsDBUrl(process.env.JAWSDB_URL);

export const config = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS - Permitir múltiples orígenes
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Base de datos - usar JawsDB si está disponible, sino usar variables individuales
  DB: jawsDB || {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'electronica_store'
  },
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'un-secreto-super-seguro',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

export const validateConfig = () => {
  const required = ['JWT_SECRET'];
  
  // En producción, verificar que no se usen valores por defecto
  if (config.NODE_ENV === 'production') {
    if (config.JWT_SECRET === 'un-secreto-super-seguro') {
      throw new Error('⚠️  JWT_SECRET debe ser cambiado en producción');
    }
    
    if (!process.env.JAWSDB_URL && !process.env.DB_HOST) {
      throw new Error('⚠️  Configuración de base de datos requerida en producción');
    }
  }
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Variables de entorno faltantes: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuración validada correctamente');
  console.log(`📍 Entorno: ${config.NODE_ENV}`);
  console.log(`🗄️  Base de datos: ${config.DB.host}:${config.DB.port}/${config.DB.database}`);
};