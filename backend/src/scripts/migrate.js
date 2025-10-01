// backend/src/scripts/migrate.js
// Ejecutar con: node src/scripts/migrate.js

import mysql from "mysql2/promise";
import { config } from "../config/env.js";

const migrate = async () => {
  let connection;
  
  try {
    console.log("🔄 Iniciando migración de base de datos...");
    
    const pool = mysql.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      port: config.DB_PORT,
      waitForConnections: true,
      connectionLimit: 1,
    });

    connection = await pool.getConnection();

    // ============================================
    // 1. MIGRACIONES DE VENTAS
    // ============================================
    console.log("\n📝 Actualizando tabla 'ventas'...");
    
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN customer_name VARCHAR(100) DEFAULT 'Cliente General'
      `);
      console.log("   ✅ Columna 'customer_name' agregada");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  Columna 'customer_name' ya existe");
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN customer_doc VARCHAR(50) NULL
      `);
      console.log("   ✅ Columna 'customer_doc' agregada");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  Columna 'customer_doc' ya existe");
      } else {
        throw error;
      }
    }

    // ============================================
    // 2. MIGRACIONES DE ITEMS_VENTA
    // ============================================
    console.log("\n📝 Actualizando tabla 'items_venta'...");
    
    try {
      await connection.execute(`
        ALTER TABLE items_venta 
        ADD COLUMN product_name VARCHAR(100) NULL
      `);
      console.log("   ✅ Columna 'product_name' agregada");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  Columna 'product_name' ya existe");
      } else {
        throw error;
      }
    }

    // ============================================
    // 3. MIGRACIONES DE REPARACIONES
    // ============================================
    console.log("\n📝 Actualizando tabla 'reparaciones'...");
    
    // Agregar columna assigned_to (técnico asignado)
    try {
      await connection.execute(`
        ALTER TABLE reparaciones 
        ADD COLUMN assigned_to INT NULL
      `);
      console.log("   ✅ Columna 'assigned_to' agregada");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  Columna 'assigned_to' ya existe");
      } else {
        throw error;
      }
    }

    // Agregar columna diagnosis (diagnóstico técnico)
    try {
      await connection.execute(`
        ALTER TABLE reparaciones 
        ADD COLUMN diagnosis TEXT NULL
      `);
      console.log("   ✅ Columna 'diagnosis' agregada");
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("   ℹ️  Columna 'diagnosis' ya existe");
      } else {
        throw error;
      }
    }

    // Agregar foreign key para assigned_to
    try {
      // Primero verificar si la foreign key ya existe
      const [fks] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'reparaciones' 
        AND COLUMN_NAME = 'assigned_to'
        AND REFERENCED_TABLE_NAME = 'usuarios'
      `, [config.DB_NAME]);

      if (fks.length === 0) {
        await connection.execute(`
          ALTER TABLE reparaciones 
          ADD CONSTRAINT fk_reparaciones_assigned_to
          FOREIGN KEY (assigned_to) REFERENCES usuarios(id)
          ON DELETE SET NULL
        `);
        console.log("   ✅ Foreign key 'fk_reparaciones_assigned_to' agregada");
      } else {
        console.log("   ℹ️  Foreign key para 'assigned_to' ya existe");
      }
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log("   ℹ️  Foreign key para 'assigned_to' ya existe");
      } else {
        console.error("   ⚠️  Error al crear foreign key:", error.message);
        // No lanzamos el error para continuar con la migración
      }
    }

    // ============================================
    // 4. ACTUALIZAR DATOS HISTÓRICOS
    // ============================================
    
    // Actualizar nombres de productos en items_venta existentes
    console.log("\n📝 Actualizando nombres de productos en ventas existentes...");
    
    const [items] = await connection.execute(`
      SELECT iv.id, iv.product_id, p.name 
      FROM items_venta iv
      LEFT JOIN productos p ON iv.product_id = p.id
      WHERE iv.product_name IS NULL
    `);

    if (items.length > 0) {
      for (const item of items) {
        if (item.name) {
          await connection.execute(
            `UPDATE items_venta SET product_name = ? WHERE id = ?`,
            [item.name, item.id]
          );
        }
      }
      console.log(`   ✅ ${items.length} registros actualizados con nombres de productos`);
    } else {
      console.log("   ℹ️  No hay registros para actualizar");
    }

    // Actualizar ventas existentes con nombre de cliente por defecto
    console.log("\n📝 Actualizando ventas existentes con cliente por defecto...");
    
    const [result] = await connection.execute(`
      UPDATE ventas 
      SET customer_name = 'Cliente General' 
      WHERE customer_name IS NULL OR customer_name = ''
    `);
    
    if (result.affectedRows > 0) {
      console.log(`   ✅ ${result.affectedRows} ventas actualizadas`);
    } else {
      console.log("   ℹ️  No hay ventas para actualizar");
    }

    // ============================================
    // 5. RESUMEN FINAL
    // ============================================
    console.log("\n✅ Migración completada exitosamente!");
    console.log("\n📊 Resumen de cambios:");
    console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   📦 Tabla 'ventas':");
    console.log("      • customer_name (VARCHAR)");
    console.log("      • customer_doc (VARCHAR)");
    console.log("\n   📦 Tabla 'items_venta':");
    console.log("      • product_name (VARCHAR)");
    console.log("\n   🔧 Tabla 'reparaciones':");
    console.log("      • assigned_to (INT) - ID del técnico asignado");
    console.log("      • diagnosis (TEXT) - Diagnóstico técnico");
    console.log("      • Foreign key a usuarios(id)");
    console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    connection.release();
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error durante la migración:", error);
    if (connection) {
      connection.release();
    }
    process.exit(1);
  }
};

// Ejecutar migración
migrate();