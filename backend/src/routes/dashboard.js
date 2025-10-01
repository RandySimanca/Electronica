import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// El dashboard solo lo puede ver el admin
router.get("/", authenticateToken, authorizeRole([USER_ROLES.ADMIN]), getDashboardData);

export default router;
