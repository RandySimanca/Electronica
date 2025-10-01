import pool from "../config/database.js";
import { MESSAGES } from "../constants.js";

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  try {
    const { name, price, stock, min_stock } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ error: MESSAGES.ERROR.PRODUCT_NAME_PRICE_REQUIRED });
    }

    await pool.execute(
      "INSERT INTO productos (name, price, stock, min_stock) VALUES (?, ?, ?, ?)",
      [name, price, stock || 0, min_stock || 0]
    );

    res.json({ message: MESSAGES.SUCCESS.PRODUCT_CREATED });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// Actualizar un producto
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, min_stock } = req.body;

    await pool.execute(
      "UPDATE productos SET name = ?, price = ?, stock = ?, min_stock = ? WHERE id = ?",
      [name, price, stock, min_stock, id]
    );

    res.json({ message: MESSAGES.SUCCESS.PRODUCT_UPDATED });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// Eliminar un producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
    res.json({ message: MESSAGES.SUCCESS.PRODUCT_DELETED });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};
