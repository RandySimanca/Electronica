// backend/src/routes/salesRoutes.js
import { Router } from "express";
import { createSale, getSales, getSaleById } from "../controllers/salesController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Listar ventas (admin puede ver todo, vendedor solo las suyas)
router.get("/", authenticateToken, getSales);

// Obtener una venta específica por ID
router.get("/:id", authenticateToken, getSaleById);

// Crear venta (solo vendedores y admin)
router.post("/", authenticateToken, authorizeRole([USER_ROLES.VENDEDOR, USER_ROLES.ADMIN]), createSale);

export default router;