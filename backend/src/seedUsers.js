import bcrypt from "bcryptjs";
import initDatabase from "./config/initDatabase.js";

const seedUsers = async () => {
  try {
    const pool = await initDatabase();
    const conn = await pool.getConnection();

    const users = [
      { nombre: "Admin", email: "admin@example.com", password: "Admin123", rol: "admin" },
      { nombre: "Vendedor", email: "vendedor@example.com", password: "Vendedor123", rol: "vendedor" },
      { nombre: "Técnico", email: "tecnico@example.com", password: "Tecnico123", rol: "tecnico" },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await conn.execute(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
        [user.nombre, user.email, hashedPassword, user.rol]
      );
    }

    conn.release();
    console.log("✅ Usuarios insertados correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al insertar usuarios:", error);
    process.exit(1);
  }
};

seedUsers();
