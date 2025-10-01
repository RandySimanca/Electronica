import pool from "../config/database.js";
import { MESSAGES } from "../constants.js";

// 📌 Obtener clientes
export const getClients = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM clientes");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Crear cliente
export const createClient = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: MESSAGES.ERROR.CLIENT_NAME_REQUIRED });
    }

    await pool.execute(
      "INSERT INTO clientes (name, phone, email) VALUES (?, ?, ?)",
      [name, phone || null, email || null]
    );

    res.json({ message: MESSAGES.SUCCESS.CLIENT_CREATED });
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Actualizar cliente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    await pool.execute(
      "UPDATE clientes SET name = ?, phone = ?, email = ? WHERE id = ?",
      [name, phone, email, id]
    );

    res.json({ message: "Cliente actualizado exitosamente" });
  } catch (error) {
    console.error("❌ Error al actualizar cliente:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Eliminar cliente
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM clientes WHERE id = ?", [id]);
    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("❌ Error al eliminar cliente:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};
