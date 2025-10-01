import { Router } from "express";
import { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from "../controllers/productsController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Listar productos (todos los roles pueden ver)
router.get("/", authenticateToken, getProductos);

// Crear producto (solo admin)
router.post("/", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), createProducto);

// Actualizar producto (solo admin)
router.put("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), updateProducto);

// Eliminar producto (solo admin)
router.delete("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), deleteProducto);

export default router;
