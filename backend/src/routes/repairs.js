import { Router } from "express";
import { 
  getRepairs, 
  createRepair, 
  updateRepairStatus,
  addDiagnosis,
  getTechniciansBySection 
} from "../controllers/repairsController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

console.log('🔧 Registrando rutas de repairs...');

router.get("/technicians/:section", 
  (req, res, next) => {
    console.log('📍 Petición recibida en /technicians/:section');
    console.log('Sección:', req.params.section);
    next();
  },
  authenticateToken, 
  authorizeRole([USER_ROLES.VENDEDOR, USER_ROLES.ADMIN]), 
  getTechniciansBySection
);

// Listar reparaciones
router.get(
  "/", 
  authenticateToken, 
  authorizeRole([USER_ROLES.ADMIN, USER_ROLES.TECNICO, USER_ROLES.VENDEDOR]), 
  getRepairs
);

// Registrar nueva reparación (vendedores)
router.post(
  "/", 
  authenticateToken, 
  authorizeRole([USER_ROLES.VENDEDOR]), 
  createRepair
);

// Actualizar estado de reparación (técnicos)
router.put(
  "/:id/status", 
  authenticateToken, 
  authorizeRole([USER_ROLES.TECNICO]), 
  updateRepairStatus
);

// Agregar diagnóstico (técnicos)
router.put(
  "/:id/diagnosis", 
  authenticateToken, 
  authorizeRole([USER_ROLES.TECNICO]), 
  addDiagnosis
);

export default router;