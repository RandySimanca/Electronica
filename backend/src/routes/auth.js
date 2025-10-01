// backend/src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import initDatabase from "../config/initDatabase.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Inicializamos pool
let pool;
initDatabase()
  .then((p) => {
    pool = p;
    console.log("✅ Conexión a la base de datos lista en auth.js");
  })
  .catch((err) => {
    console.error("❌ Error al inicializar la base de datos en auth.js:", err);
  });

// Middleware para asegurar que pool esté listo
const requirePool = (req, res, next) => {
  if (!pool) return res.status(500).json({ error: "Base de datos no inicializada" });
  next();
};

// Registrar usuario (solo admin)
router.post("/register", requirePool, authenticateToken, authorizeRole([USER_ROLES.ADMIN]), async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol]
    );

    res.json({ message: "Usuario registrado", userId: result.insertId });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login
router.post("/login", requirePool, async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar por nombre o email
    const [rows] = await pool.execute(
      "SELECT * FROM usuarios WHERE nombre = ? OR email = ? AND active = TRUE",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token con rol y nombre
    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      config.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        section: user.section  // 👈 AGREGADO: Incluir la especialidad del técnico
      },
      token,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;