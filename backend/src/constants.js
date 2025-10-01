// backend/src/constants.js

// 👤 Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  TECNICO: 'tecnico'
};

// 🏗️ Secciones técnicas
export const SECTIONS = {
  ELECTRONICA: 'electronica',
  SISTEMAS: 'sistemas',
  CELULARES: 'celulares'
};

// 📱 Estados de reparación
export const REPAIR_STATUS = {
  RECIBIDO: 'recibido',
  EN_REVISION: 'en_revision',
  EN_REPARACION: 'en_reparacion',
  REPARADO: 'reparado',
  ENTREGADO: 'entregado',
  NO_REPARABLE: 'no_reparable'
};

// 💳 Métodos de pago
export const PAYMENT_METHODS = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia'
};

// 📝 Mensajes del sistema
export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'Usuario creado exitosamente',
    USER_UPDATED: 'Usuario actualizado exitosamente',
    USER_DELETED: 'Usuario eliminado exitosamente',
    PRODUCT_CREATED: 'Producto creado exitosamente',
    PRODUCT_UPDATED: 'Producto actualizado exitosamente',
    PRODUCT_DELETED: 'Producto eliminado exitosamente',
    STOCK_UPDATED: 'Stock actualizado exitosamente',
    SALE_CREATED: 'Venta creada exitosamente',
    CLIENT_CREATED: 'Cliente creado exitosamente',
    CLIENT_UPDATED: 'Cliente actualizado exitosamente',
    CLIENT_DELETED: 'Cliente eliminado exitosamente',
    REPAIR_CREATED: 'Reparación registrada exitosamente',
    REPAIR_UPDATED: 'Reparación actualizada exitosamente',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente'
  },
  
  ERROR: {
    // Errores generales
    INTERNAL_ERROR: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'No tienes permisos para esta acción',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Error de validación',
    
    // Errores de usuario
    REQUIRED_FIELDS: 'Faltan campos obligatorios',
    USER_NOT_FOUND: 'Usuario no encontrado',
    USER_EMAIL_EXISTS: 'El usuario o email ya existe',
    INVALID_ROLE: 'Rol inválido',
    TECHNICIAN_SECTION_REQUIRED: 'Los técnicos deben tener una sección asignada',
    
    // Errores de productos
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    PRODUCT_NAME_PRICE_REQUIRED: 'Nombre y precio son requeridos',
    INSUFFICIENT_STOCK: 'Stock insuficiente para el producto',
    
    // Errores de ventas
    ITEMS_REQUIRED: 'Debe incluir al menos un producto en la venta',
    INVALID_QUANTITY: 'Cantidad inválida',
    
    // Errores de clientes
    CLIENT_NAME_REQUIRED: 'El nombre del cliente es requerido',
    CLIENT_NOT_FOUND: 'Cliente no encontrado',
    
    // Errores de reparaciones
    REPAIR_NOT_FOUND: 'Reparación no encontrada',
    INVALID_REPAIR_STATUS: 'Estado de reparación inválido',
    REPAIR_FIELDS_REQUIRED: 'Faltan campos requeridos para la reparación'
  }
};

// 🔧 Configuraciones de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
  
  // Regex patterns
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\+\-\(\)]+$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
};

// 📊 Configuraciones de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// 🗂️ Configuraciones de archivos (para futuras implementaciones)
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  UPLOAD_PATH: './uploads/'
};

// 🌐 Códigos de estado HTTP más utilizados
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// 📅 Configuraciones de tiempo
export const TIME_CONFIG = {
  JWT_EXPIRES_IN: '8h',
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas en ms
  PASSWORD_RESET_EXPIRES: 15 * 60 * 1000 // 15 minutos en ms
};

// 🔐 Configuraciones de seguridad
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
  
  // Headers de seguridad
  CORS_MAX_AGE: 86400, // 24 horas
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX: 100 // requests por ventana
};