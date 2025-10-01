import { Router } from "express";
import { getClients, createClient, updateClient, deleteClient } from "../controllers/clientsController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Listar clientes (vendedores y admin pueden verlos)
router.get("/", authenticateToken, authorizeRole([USER_ROLES.ADMIN, USER_ROLES.VENDEDOR]), getClients);

// Crear cliente (vendedor o admin)
router.post("/", authenticateToken, authorizeRole([USER_ROLES.ADMIN, USER_ROLES.VENDEDOR]), createClient);

// Actualizar cliente (vendedor o admin)
router.put("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN, USER_ROLES.VENDEDOR]), updateClient);

// Eliminar cliente (solo admin)
router.delete("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), deleteClient);

export default router;
