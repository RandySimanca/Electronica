import { config } from './env.js';

// Configuración de CORS
export const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier origen
    if (config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar orígenes permitidos
    const allowedOrigins = config.CORS_ORIGIN.split(',');
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count']
};