import pool from "../config/database.js";
import { MESSAGES } from "../constants.js";

// 📌 Obtener datos generales del dashboard
export const getDashboardData = async (req, res) => {
  try {
    const [users] = await pool.execute("SELECT COUNT(*) as total_users FROM usuarios");
    const [products] = await pool.execute("SELECT COUNT(*) as total_products FROM productos");
    const [lowStock] = await pool.execute("SELECT COUNT(*) as low_stock FROM productos WHERE stock <= min_stock");
    const [sales] = await pool.execute("SELECT COUNT(*) as total_sales, SUM(total) as revenue FROM ventas");
    const [repairs] = await pool.execute("SELECT COUNT(*) as pending_repairs FROM reparaciones WHERE status != 'completada'");

    res.json({
      users: users[0].total_users,
      products: products[0].total_products,
      lowStock: lowStock[0].low_stock,
      sales: {
        count: sales[0].total_sales || 0,
        revenue: sales[0].revenue || 0,
      },
      pendingRepairs: repairs[0].pending_repairs,
    });
  } catch (error) {
    console.error("❌ Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};
