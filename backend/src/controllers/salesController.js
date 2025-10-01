// backend/src/controllers/salesController.js
import pool from "../config/database.js";
import { MESSAGES } from "../constants.js";

// 📌 Crear una venta
export const createSale = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, total, payment_method, customer_name, customer_doc } = req.body;
    const userId = req.user.id; // viene del JWT

    if (!items || items.length === 0) {
      return res.status(400).json({ error: MESSAGES.ERROR.ITEMS_REQUIRED });
    }

    await connection.beginTransaction();

    // Insertar venta con información del cliente
    const [result] = await connection.execute(
      "INSERT INTO ventas (user_id, total, payment_method, customer_name, customer_doc) VALUES (?, ?, ?, ?, ?)",
      [userId, total, payment_method, customer_name || 'Cliente General', customer_doc || null]
    );

    const saleId = result.insertId;

    // Insertar items de la venta y actualizar stock
    for (const item of items) {
      const [product] = await connection.execute(
        "SELECT stock, name FROM productos WHERE id = ?",
        [item.product_id]
      );

      if (product.length === 0) {
        throw new Error(`${MESSAGES.ERROR.PRODUCT_NOT_FOUND}: ${item.product_id}`);
      }

      if (product[0].stock < item.quantity) {
        throw new Error(`${MESSAGES.ERROR.INSUFFICIENT_STOCK} ${item.product_id}`);
      }

      await connection.execute(
        "INSERT INTO items_venta (sale_id, product_id, quantity, price, product_name) VALUES (?, ?, ?, ?, ?)",
        [saleId, item.product_id, item.quantity, item.price, product[0].name]
      );

      await connection.execute(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();
    res.json({ message: MESSAGES.SUCCESS.SALE_CREATED, sale_id: saleId });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al crear venta:", error);
    res.status(500).json({ error: error.message || MESSAGES.ERROR.INTERNAL_ERROR });
  } finally {
    connection.release();
  }
};

// 📌 Obtener ventas con items
export const getSales = async (req, res) => {
  try {
    let query = `
      SELECT 
        v.id,
        v.user_id,
        v.total,
        v.payment_method,
        v.customer_name,
        v.customer_doc,
        v.created_at,
        u.nombre as seller_name
      FROM ventas v
      LEFT JOIN usuarios u ON v.user_id = u.id
    `;
    let values = [];

    if (req.user.rol === "vendedor") {
      query += " WHERE v.user_id = ?";
      values = [req.user.id];
    }

    query += " ORDER BY v.created_at DESC";

    const [sales] = await pool.execute(query, values);

    // Obtener items de cada venta
    for (const sale of sales) {
      const [items] = await pool.execute(
        `SELECT 
          iv.id,
          iv.product_id,
          iv.quantity,
          iv.price,
          iv.product_name,
          p.name as current_product_name
        FROM items_venta iv
        LEFT JOIN productos p ON iv.product_id = p.id
        WHERE iv.sale_id = ?`,
        [sale.id]
      );
      
      // Usar el nombre guardado o el actual si existe
      sale.items = items.map(item => ({
        ...item,
        product_name: item.product_name || item.current_product_name || 'Producto'
      }));
    }

    res.json(sales);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Obtener una venta específica con todos sus detalles
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos: admin puede ver todas, vendedor solo las suyas
    let query = `
      SELECT 
        v.id,
        v.user_id,
        v.total,
        v.payment_method,
        v.customer_name,
        v.customer_doc,
        v.created_at,
        u.nombre as seller_name
      FROM ventas v
      LEFT JOIN usuarios u ON v.user_id = u.id
      WHERE v.id = ?
    `;
    let values = [id];

    if (req.user.rol === "vendedor") {
      query += " AND v.user_id = ?";
      values.push(req.user.id);
    }

    const [sales] = await pool.execute(query, values);

    if (sales.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const sale = sales[0];

    // Obtener items de la venta
    const [items] = await pool.execute(
      `SELECT 
        iv.id,
        iv.product_id,
        iv.quantity,
        iv.price,
        iv.product_name,
        p.name as current_product_name
      FROM items_venta iv
      LEFT JOIN productos p ON iv.product_id = p.id
      WHERE iv.sale_id = ?`,
      [sale.id]
    );

    sale.items = items.map(item => ({
      ...item,
      product_name: item.product_name || item.current_product_name || 'Producto'
    }));

    res.json(sale);
  } catch (error) {
    console.error("❌ Error al obtener venta:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};