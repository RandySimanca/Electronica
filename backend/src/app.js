import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/response.js';
import routes from './routes/index.js';
import initDatabase from './config/initDatabase.js';
import { closePool } from './config/database.js';

// Validar configuración antes de iniciar
validateConfig();

const app = express();

// Configuración de CORS dinámica
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim());
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (solo en desarrollo)
if (config.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Rutas de la API
app.use('/api', routes);

// Ruta de estado de la API
app.get('/', (req, res) => {
  successResponse(res, {
    name: 'Electronics Workshop API',
    version: '1.0.0',
    status: 'running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  }, 'API funcionando correctamente');
});

// Ruta de salud
app.get('/health', (req, res) => {
  successResponse(res, {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }, 'Sistema saludable');
});

// Middleware para rutas no encontradas
app.all(/.*/, notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    console.log('🔧 Inicializando base de datos...');
    await initDatabase();
    
    console.log('🚀 Iniciando servidor...');
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      console.log(`
┌─────────────────────────────────────────────┐
│     🔧 Electronics Workshop API             │
├─────────────────────────────────────────────┤
│ 🌟 Estado: Funcionando                      │
│ 🚀 Puerto: ${config.PORT}                            │
│ 🌍 Entorno: ${config.NODE_ENV}                    │
│ 📅 Iniciado: ${new Date().toLocaleString()}       │
└─────────────────────────────────────────────┘
      `);
    });

    return server;
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
const gracefulShutdown = async (signal) => {
  console.log(`\n👋 Señal ${signal} recibida. Cerrando servidor...`);
  
  try {
    await closePool();
    console.log('✅ Conexiones cerradas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();