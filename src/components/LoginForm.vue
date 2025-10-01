<template>
  <div class="login-root">
    <div class="login-card">
      <h2 class="login-title">Iniciar Sesión</h2>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Tu nombre de usuario"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="********"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="btn">
          {{ loading ? "Ingresando..." : "Entrar" }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <!--<div class="login-footer">
        ¿No tienes cuenta?
        <router-link to="/">Regístrate aquí</router-link>
      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import api from "@/services/api";

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const router = useRouter();
const userStore = useUserStore();

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const res = await api.post("/auth/login", {
      username: username.value,
      password: password.value,
    });

    userStore.login(res.data.user, res.data.token);
    router.push("/dashboard");
  } catch (err) {
    error.value =
      err.response?.data?.error || "Error al iniciar sesión. Intenta de nuevo.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Fondo con gradiente */
.login-root {
  height: 100vh; /* 🔥 usa height fija, no min-height */
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #312e81, #6d28d9, #db2777);
  overflow: hidden; /* 🔥 evita scroll innecesario */
}

/* Tarjeta elegante */
.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  padding: 2.5rem; /* 🔥 reduje un poco el padding */
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.6s ease-out;
  max-height: 95vh; /* 🔥 evita que la tarjeta sobrepase la pantalla */
  overflow-y: auto; /* 🔥 en móviles, solo la tarjeta scrollea si es necesario */
}

/* Animación entrada */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 0.6px;
}

/* Inputs */
.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.4rem;
}

input {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  font-size: 1rem;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

/* Botón */
.btn {
  width: 100%;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: white;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Error */
.error {
  margin-top: 1rem;
  text-align: center;
  color: #ef4444;
  font-size: 0.9rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Footer */
.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.2rem;
}

.login-footer a {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
