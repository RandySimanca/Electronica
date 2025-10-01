<template>
  <div class="users-container">
    <h1 class="title">Gestión de Usuarios</h1>

    <!-- Formulario para agregar usuario -->
    <form class="user-form" @submit.prevent="addUser">
      <div class="form-group">
        <label for="username">Nombre de usuario</label>
        <input id="username" v-model="newUser.username" placeholder="Ej: admin" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="newUser.email" placeholder="Ej: admin@example.com" required />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" type="password" v-model="newUser.password" placeholder="Contraseña" required />
      </div>

      <div class="form-group">
        <label for="role">Rol</label>
        <select id="role" v-model="newUser.role" required>
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="tecnico">Técnico</option>
        </select>
      </div>

      <div class="form-group" v-if="newUser.role === 'tecnico'">
        <label for="section">Sección</label>
        <select id="section" v-model="newUser.section">
          <option value="electronica">Electrónica</option>
          <option value="sistemas">Sistemas</option>
          <option value="celulares">Celulares</option>
        </select>
      </div>

      <button type="submit">Agregar Usuario</button>
    </form>

    <!-- Tabla de usuarios -->
    <table class="user-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Sección</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, i) in users" :key="i">
          <td v-if="editingUser?.id !== user.id">{{ user.nombre || user.username }}</td>
          <td v-else><input v-model="editingUser.nombre" /></td>

          <td v-if="editingUser?.id !== user.id">{{ user.email }}</td>
          <td v-else><input type="email" v-model="editingUser.email" /></td>

          <td v-if="editingUser?.id !== user.id">{{ user.rol || user.role }}</td>
          <td v-else>
            <select v-model="editingUser.rol">
              <option value="admin">Admin</option>
              <option value="vendedor">Vendedor</option>
              <option value="tecnico">Técnico</option>
            </select>
          </td>

          <td v-if="editingUser?.id !== user.id">{{ user.section }}</td>
          <td v-else>
            <select v-model="editingUser.section" v-if="editingUser.rol === 'tecnico'">
              <option value="electronica">Electrónica</option>
              <option value="sistemas">Sistemas</option>
              <option value="celulares">Celulares</option>
            </select>
            <span v-else>-</span>
          </td>

          <td v-if="editingUser?.id !== user.id">{{ user.active ? 'Sí' : 'No' }}</td>
          <td v-else><input type="checkbox" v-model="editingUser.active" /></td>

          <td>
            <button v-if="editingUser?.id !== user.id" @click="startEdit(user)" class="edit-btn">Editar</button>
            <button v-else @click="saveEdit" class="save-btn">Guardar</button>
            <button v-if="editingUser?.id !== user.id" @click="cancelEdit" class="cancel-btn">Cancelar</button>
            <button @click="deleteUser(user.id)" class="delete-btn">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/api";

const users = ref([]);
const editingUser = ref(null);
const newUser = ref({
  username: "",
  email: "",
  password: "",
  role: "",
  section: "",
});

const loadUsers = async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data;
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
  }
};

const addUser = async () => {
  try {
    if (!newUser.value.username || !newUser.value.email || !newUser.value.password || !newUser.value.role) {
      alert("Todos los campos son obligatorios");
      return;
    }

    await api.post("/users", {
      username: newUser.value.username,
      email: newUser.value.email,
      password: newUser.value.password,
      role: newUser.value.role,
      section: newUser.value.section || null,
    });

    await loadUsers();
    newUser.value = { username: "", email: "", password: "", role: "", section: "" };
  } catch (err) {
    console.error("Error al crear usuario:", err);
    alert(err.response?.data?.error || "Error al crear usuario");
  }
};

const startEdit = (user) => {
  editingUser.value = { ...user };
};

const saveEdit = async () => {
  try {
    await api.put(`/users/${editingUser.value.id}`, {
      username: editingUser.value.nombre || editingUser.value.username,
      email: editingUser.value.email,
      password: editingUser.value.password || "", // optional
      role: editingUser.value.rol || editingUser.value.role,
      section: editingUser.value.section || null,
      active: editingUser.value.active,
    });
    await loadUsers();
    editingUser.value = null;
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    alert(err.response?.data?.error || "Error al actualizar usuario");
  }
};

const cancelEdit = () => {
  editingUser.value = null;
};

const deleteUser = async (id) => {
  if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
  try {
    await api.delete(`/users/${id}`);
    await loadUsers();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    alert(err.response?.data?.error || "Error al eliminar usuario");
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.users-container {
  max-width: 1000px;
  margin: 2rem auto;
  background: #fdfdfd;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #2c3e50;
}

.user-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.user-form input, .user-form select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.user-form label {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  color: #34495e;
}

.user-form button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-form button:hover {
  background-color: #2980b9;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.user-table th {
  background-color: #34495e;
  color: white;
  padding: 0.75rem;
  text-align: left;
}

.user-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

.user-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.user-table input, .user-table select {
  width: 100%;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-btn, .save-btn, .cancel-btn, .delete-btn {
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.save-btn {
  background-color: #27ae60;
  color: white;
}

.save-btn:hover {
  background-color: #229954;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>