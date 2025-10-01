import pool from "../config/database.js";
import { MESSAGES } from "../constants.js";

// 📌 Obtener técnicos por sección
export const getTechniciansBySection = async (req, res) => {
  try {
    const { section } = req.params;
    
    const [rows] = await pool.execute(
      "SELECT id, nombre as name, section FROM usuarios WHERE rol = 'tecnico' AND section = ?",
      [section]
    );
    
    console.log(`Técnicos encontrados en ${section}:`, rows.length);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Obtener reparaciones
export const getRepairs = async (req, res) => {
  try {
    let query = `
      SELECT r.*, 
             c.name as client_name, 
             c.phone as client_phone,
             c.doc as client_doc,
             t.nombre as technician_name
      FROM reparaciones r
      LEFT JOIN clientes c ON r.client_id = c.id
      LEFT JOIN usuarios t ON r.assigned_to = t.id
    `;
    let values = [];

    // Si es técnico, solo ve las asignadas a él
    if (req.user.rol === "tecnico") {
      query += " WHERE r.assigned_to = ?";
      values = [req.user.id];
    }

    query += " ORDER BY r.created_at DESC";

    const [rows] = await pool.execute(query, values);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener reparaciones:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Crear reparación y asignar a técnico
export const createRepair = async (req, res) => {
  try {
    const { 
      client_name, 
      client_phone, 
      client_doc, 
      device, 
      issue_description, 
      section, 
      assigned_to 
    } = req.body;

    // Validar datos requeridos
    if (!client_name || !client_phone || !device || !issue_description || !section || !assigned_to) {
      return res.status(400).json({ error: "Faltan datos obligatorios de la reparación" });
    }

    // Verificar que el técnico pertenezca a la sección correcta
    const [technician] = await pool.execute(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'tecnico' AND section = ?",
      [assigned_to, section]
    );

    if (technician.length === 0) {
      return res.status(400).json({ error: "El técnico no pertenece a esta sección" });
    }

    // Buscar o crear el cliente
    let clientId;
    
    // Primero intentar buscar por teléfono (más común)
    const [existingClient] = await pool.execute(
      "SELECT id FROM clientes WHERE phone = ?",
      [client_phone]
    );

    if (existingClient.length > 0) {
      // Cliente existe, usar su ID
      clientId = existingClient[0].id;
      
      // Actualizar información del cliente si cambió
      await pool.execute(
        "UPDATE clientes SET name = ?, doc = ? WHERE id = ?",
        [client_name, client_doc || null, clientId]
      );
    } else {
      // Cliente no existe, crearlo
      const [newClient] = await pool.execute(
        "INSERT INTO clientes (name, phone, doc, created_at) VALUES (?, ?, ?, NOW())",
        [client_name, client_phone, client_doc || null]
      );
      clientId = newClient.insertId;
    }

    // Crear la reparación
    const [result] = await pool.execute(
      `INSERT INTO reparaciones 
       (client_id, device, issue_description, section, assigned_to, status, created_at) 
      VALUES (?, ?, ?, ?, ?, 'recibido', NOW())`,       
      [clientId, device, issue_description, section, assigned_to]
    );

    res.json({ 
      message: "Reparación registrada y asignada exitosamente",
      id: result.insertId,
      client_id: clientId
    });
  } catch (error) {
    console.error("❌ Error al crear reparación:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};

// 📌 Actualizar estado de reparación
export const updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
  

    // ✅ Estados válidos en tu tabla
    if (!["pendiente", "en_proceso", "completada"].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    // 👮 Verificar que el técnico solo actualice sus reparaciones
    if (req.user.rol === "tecnico") {
      const [repair] = await pool.execute(
        "SELECT id FROM reparaciones WHERE id = ? AND assigned_to = ?",
        [id, req.user.id]
      );

      if (repair.length === 0) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta reparación" });
      }
    }

    await pool.execute(
      "UPDATE reparaciones SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Estado de reparación actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar reparación:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR });
  }
};


// 📌 Agregar diagnóstico (solo técnicos)
export const addDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis } = req.body;

    console.log("📥 Diagnóstico recibido:", diagnosis);
    console.log("👤 Usuario autenticado:", req.user);

    if (!diagnosis || diagnosis.trim() === "") {
      return res.status(400).json({ error: "El diagnóstico no puede estar vacío" });
    }

    const [repair] = await pool.execute(
      "SELECT id FROM reparaciones WHERE id = ? AND assigned_to = ?",
      [id, req.user?.id]
    );
    console.log("🔍 Reparación encontrada:", repair);

    if (repair.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para diagnosticar esta reparación" });
    }

    await pool.execute(
      "UPDATE reparaciones SET diagnosis = ?, status = 'en_proceso', updated_at = NOW() WHERE id = ?",
      [diagnosis, id]
    );

    res.json({ message: "Diagnóstico agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar diagnóstico:", error);
    res.status(500).json({ error: MESSAGES.ERROR.INTERNAL_ERROR, details: error.message });
  }
};
