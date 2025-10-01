<template>
  <div id="app">
    <Navbar v-if="userStore.user" />
    <div style="display: flex">
      <Sidebar v-if="userStore.user" />
      <main style="flex: 1; padding: 1rem">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";

const userStore = useUserStore();
</script>
