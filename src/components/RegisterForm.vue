<template>
  <div class="register-container">
    <h2>Registrar Usuario</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="nombre" placeholder="Nombre" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="contraseña" type="password" placeholder="Contraseña" required />
      <select v-model="rol" required>
        <option value="" disabled>Selecciona un rol</option>
        <option value="admin">Admin</option>
        <option value="vendedor">Vendedor</option>
        <option value="tecnico">Técnico</option>
      </select>
      <button type="submit" :disabled="loading">
        {{ loading ? "Registrando..." : "Registrar" }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
    <router-link to="/">¿Ya tienes cuenta? Inicia sesión</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

const nombre = ref("");
const email = ref("");
const contraseña = ref("");
const rol = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

const router = useRouter();

async function handleRegister() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const res = await api.post("/auth/register", {
      nombre: nombre.value,
      email: email.value,
      contraseña: contraseña.value,
      rol: rol.value,
    });

    success.value = "Usuario registrado exitosamente. Ahora puedes iniciar sesión.";
    // Optionally redirect to login after a delay
    setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (err) {
    error.value =
      err.response?.data?.error || "Error al registrar usuario. Intenta de nuevo.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  max-width: 300px;
  margin: auto;
  padding: 2rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
.success {
  color: green;
  margin-top: 1rem;
}
</style>