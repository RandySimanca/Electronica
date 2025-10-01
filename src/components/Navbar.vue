<template>
  <nav class="navbar">
    <h2>Electrónica Store</h2>
    <div v-if="userStore.user">
      <span>{{ userStore.user.nombre }} ({{ userStore.user.rol }})</span>
      <button @click="logout">Salir</button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const router = useRouter();

function logout() {
  userStore.logout();
  router.push("/");
}
</script>

<style scoped>
.navbar {
  background: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}
button {
  margin-left: 1rem;
}
</style>
