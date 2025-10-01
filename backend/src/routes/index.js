import { Router } from 'express';
import authRoutes from './auth.js';
console.log('Loading users routes');
import usersRoutes from './users.js';
console.log('usersRoutes loaded:', !!usersRoutes);
import productsRoutes from './products.js';
import salesRoutes from './sales.js';
import clientsRoutes from './clients.js';
import repairsRoutes from './repairs.js';
import dashboardRoutes from './dashboard.js';

const router = Router();

// Definir todas las rutas
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/clients', clientsRoutes);
router.use('/repairs', repairsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;