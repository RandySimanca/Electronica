import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { USER_ROLES, SECTIONS, MESSAGES } from "../constants.js";

// 📌 Crear usuario (solo Admin)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, section } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: MESSAGES.ERROR.REQUIRED_FIELDS });
    }

    // Validar rol
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    // Si es técnico, validar sección
    if (role === USER_ROLES.TECNICO && !Object.values(SECTIONS).includes(section)) {
      return res.status(400).json({ error: MESSAGES.ERROR.TECHNICIAN_SECTION_REQUIRED });
    }

    // Validar que no exista usuario
    const [existing] = await pool.execute(
      "SELECT id FROM usuarios WHERE nombre = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: MESSAGES.ERROR.USER_EMAIL_EXISTS });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await pool.execute(
      "INSERT INTO usuarios (nombre, email, password, rol, section, active) VALUES (?, ?, ?, ?, ?, TRUE)",
      [username, email, hashedPassword, role, section || null]
    );

    res.json({ message: MESSAGES.SUCCESS.USER_CREATED });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Obtener lista de usuarios (solo Admin)
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, nombre, email, rol, section, active FROM usuarios"
    );
    console.log('Users found:', rows);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Actualizar usuario (solo Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, section, active } = req.body;

    // Si hay password, encriptar
    let query = "UPDATE usuarios SET nombre=?, email=?, rol=?, section=?, active=? WHERE id=?";
    let values = [username, email, role, section || null, active, id];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE usuarios SET nombre=?, email=?, password=?, rol=?, section=?, active=? WHERE id=?";
      values = [username, email, hashedPassword, role, section || null, active, id];
    }

    await pool.execute(query, values);

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Eliminar usuario (solo Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};
