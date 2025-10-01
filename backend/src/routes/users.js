import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/usersController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Obtener lista de usuarios (solo admin)
router.get("/", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), getUsers);

// Crear un nuevo usuario (solo el admin puede hacerlo)
router.post(
  "/",
  authenticateToken,
  authorizeRole([USER_ROLES.ADMIN]),
  createUser
);

// Actualizar usuario (solo admin)
router.put("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), updateUser);

// Eliminar usuario (solo admin)
router.delete("/:id", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), deleteUser);

console.log('exporting users router');
export default router;
