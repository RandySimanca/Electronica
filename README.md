# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).



# Electronics Workshop API

API REST para la gestión de un taller de electrónicos con funcionalidades de ventas, inventario, clientes y reparaciones.

## 📋 Características

- **Autenticación JWT**: Sistema de autenticación seguro con roles
- **Gestión de Usuarios**: Administración de usuarios con diferentes roles (admin, vendedor, técnico)
- **Inventario**: Control de productos y stock
- **Ventas**: Sistema completo de ventas con control de inventario
- **Clientes**: Gestión de base de datos de clientes
- **Reparaciones**: Sistema de seguimiento de reparaciones por sección
- **Dashboard**: Estadísticas y reportes para administradores

## 🛠️ Tecnologías

- **Node.js** con ES6 modules
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 📁 Estructura del proyecto

```
src/
├── app.js                      # Archivo principal
├── config/
│   ├── database.js            # Configuración de base de datos
│   └── initDatabase.js        # Inicialización de DB y tablas
├── controllers/
│   ├── authController.js      # Controlador de autenticación
│   ├── usersController.js     # Controlador de usuarios
│   ├── productsController.js  # Controlador de productos
│   ├── salesController.js     # Controlador de ventas
│   ├── clientsController.js   # Controlador de clientes
│   ├── repairsController.js   # Controlador de reparaciones
│   └── dashboardController.js # Controlador de dashboard
├── middleware/
│   └── auth.js                # Middlewares de autenticación
└── routes/
    ├── index.js               # Índice de rutas
    ├── auth.js               # Rutas de autenticación
    ├── users.js              # Rutas de usuarios
    ├── products.js           # Rutas de productos
    ├── sales.js              # Rutas de ventas
    ├── clients.js            # Rutas de clientes
    ├── repairs.js            # Rutas de reparaciones
    └── dashboard.js          # Rutas de dashboard
```

## 🚀 Instalación

1. Clona el repositorio
```bash
git clone <repository-url>
cd electronics-workshop-api
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus configuraciones:
```env
PORT=3000
JWT_SECRET=tu-secreto-jwt-muy-seguro
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu-password
DB_NAME=electronics_workshop
```

5. Inicia el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 👤 Usuario por defecto

Al inicializar la base de datos se crea automáticamente un usuario administrador:

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: `admin`

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios (Solo Admin)
- `GET /api/users` - Obtener todos los usuarios
- `POST /api/users` - Crear usuario

### Productos
- `GET /api/products` - Obtener productos
- `POST /api/products` - Crear producto (Solo Admin)
- `PUT /api/products/:id/stock` - Actualizar stock (Solo Admin)

### Ventas (Admin y Vendedores)
- `POST /api/sales` - Crear venta
- `GET /api/sales` - Obtener ventas

### Clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients` - Obtener clientes

### Reparaciones
- `POST /api/repairs` - Crear reparación (Admin y Vendedores)
- `GET /api/repairs` - Obtener reparaciones
- `PUT /api/repairs/:id/assign` - Asignar técnico (Solo Admin)
- `PUT /api/repairs/:id/status` - Actualizar estado (Admin y Técnicos)

### Dashboard (Solo Admin)
- `GET /api/dashboard` - Obtener estadísticas

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Gestión de usuarios
- Gestión de productos e inventario
- Asignación de técnicos
- Dashboard y reportes

### Vendedor
- Crear y ver ventas
- Gestión de clientes
- Crear órdenes de reparación
- Ver productos

### Técnico
- Ver y actualizar reparaciones de su sección
- Ver productos
- Gestión de clientes

## 🔧 Secciones de Reparación

- **Electrónica**: Reparaciones de componentes electrónicos
- **Sistemas**: Reparaciones de computadoras y equipos
- **Celulares**: Reparaciones de dispositivos móviles

## 📊 Base de Datos

La aplicación utiliza MySQL con las siguientes tablas principales:

- `users` - Usuarios del sistema
- `products` - Catálogo de productos
- `sales` / `sale_items` - Ventas y detalles
- `clients` - Base de datos de clientes
- `repairs` - Órdenes de reparación

## 🛡️ Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT con expiración
- Validación de permisos por rol
- Validación de datos de entrada

## 📝 Notas de Desarrollo

- Utiliza ES6 modules (`import`/`export`)
- Compatible con Vue 3 y frameworks modernos
- Arquitectura MVC modular
- Transacciones de base de datos para operaciones críticas
- Manejo de errores centralizado