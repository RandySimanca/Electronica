import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/response.js';
import routes from './routes/index.js';
import initDatabase from './config/initDatabase.js';
import { closePool } from './config/database.js';

// Para usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validar configuración antes de iniciar
validateConfig();

const app = express();

// ============ CONFIGURACIÓN DE CORS MEJORADA ============
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, curl, mismo servidor)
    if (!origin) {
      return callback(null, true);
    }
    
    // Lista de orígenes permitidos
    const allowedOrigins = config.CORS_ORIGIN 
      ? config.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['*'];
    
    // Si CORS_ORIGIN es *, permitir cualquier origen
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // En producción, permitir el propio dominio de Heroku
    if (config.NODE_ENV === 'production') {
      // Permitir el mismo host (cuando frontend y backend están juntos)
      const requestHost = origin.replace(/^https?:\/\//, '');
      const allowSameHost = true;
      
      if (allowSameHost) {
        console.log(`✅ CORS permitido para: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Si llegamos aquí, rechazar
    console.warn(`❌ CORS bloqueado para: ${origin}`);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (solo en desarrollo)
if (config.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// ============ RUTAS DE LA API ============
// Ruta de estado de la API
app.get('/api', (req, res) => {
  successResponse(res, {
    name: 'Electronics Workshop API',
    version: '1.0.0',
    status: 'running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  }, 'API funcionando correctamente');
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  successResponse(res, {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }, 'Sistema saludable');
});

// Todas las rutas de la API con prefijo /api
app.use('/api', routes);

// ============ SERVIR FRONTEND VUE EN PRODUCCIÓN ============
const isProduction = config.NODE_ENV === 'production';
const serveFrontend = process.env.SERVE_FRONTEND === 'true' || isProduction;

if (serveFrontend) {
  // Path al build de Vue (carpeta dist en la raíz del proyecto)
  const distPath = path.join(__dirname, '../../dist');
  
  console.log('📦 Sirviendo frontend desde:', distPath);
  
  // Servir archivos estáticos de Vue
  app.use(express.static(distPath));
  
  // Todas las rutas que NO sean /api/* retornan el index.html de Vue
  // Esto permite que Vue Router maneje las rutas del frontend
  app.get('*', (req, res, next) => {
    // Si es una ruta de API, pasar al siguiente middleware
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Servir index.html para todas las demás rutas
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        console.error('❌ Error al servir index.html:', err);
        res.status(500).send('Error al cargar la aplicación');
      }
    });
  });
} else {
  console.log('ℹ️  Frontend no se servirá desde el backend (modo desarrollo)');
  
  // En desarrollo, solo manejar rutas de API
  app.all(/.*/, notFoundHandler);
}

// Middleware global de manejo de errores (debe ir al final)
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
│ 🚀 Puerto: ${config.PORT.toString().padEnd(30)}│
│ 🌍 Entorno: ${config.NODE_ENV.padEnd(28)}│
│ 🎨 Frontend: ${serveFrontend ? 'Activo'.padEnd(27) : 'Desactivado'.padEnd(27)}│
│ 🔒 CORS: ${config.CORS_ORIGIN.padEnd(31)}│
│ 📅 Iniciado: ${new Date().toLocaleString().padEnd(25)}│
├─────────────────────────────────────────────┤
│ 📡 API: http://localhost:${config.PORT}/api          │
${serveFrontend ? `│ 🌐 App: http://localhost:${config.PORT}               │` : ''}
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