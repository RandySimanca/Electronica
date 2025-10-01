<template>
  <aside class="sidebar" v-if="userStore.user && rol">
    <!-- Header del Sidebar -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-icon">⚡</div>
        <h1 class="logo-text">Electrónica</h1>
      </div>
      <p class="logo-subtitle">Store Manager</p>
    </div>

    <!-- User Info -->
    <div class="user-card">
      <div class="user-avatar">
        {{ (userStore.user.nombre || userStore.user.username).charAt(0).toUpperCase() }}
      </div>
      <div class="user-info">
        <p class="user-name">{{ userStore.user.nombre || userStore.user.username }}</p>
        <p class="user-role">{{ rol }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <p class="nav-section">Menú Principal</p>
      
      <ul class="nav-list">
        <!-- Admin Options -->
        <li v-if="rol === 'admin'" class="nav-item">
          <router-link to="/inventory" class="nav-link">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Inventario</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </li>

        <li v-if="rol === 'admin'" class="nav-item">
          <router-link to="/users" class="nav-link">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Usuarios</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </li>

        <!-- Vendedor Options -->
        <li v-if="rol === 'vendedor'" class="nav-item">
          <router-link to="/sales" class="nav-link">
            <span class="nav-icon">💰</span>
            <span class="nav-text">Ventas</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </li>

        <li v-if="rol === 'vendedor'" class="nav-item">
          <router-link to="/repairs" class="nav-link">
            <span class="nav-icon">🔧</span>
            <span class="nav-text">Reparaciones</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </li>

        <!-- Técnico Options -->
        <li v-if="rol === 'tecnico'" class="nav-item">
          <router-link to="/technicians" class="nav-link">
            <span class="nav-icon">🛠️</span>
            <span class="nav-text">Asignaciones</span>
            <span class="nav-arrow">›</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-stats">
        <div class="stat-item">
          <span class="stat-icon">✓</span>
          <span class="stat-text">Sistema Activo</span>
        </div>
      </div>
      <p class="footer-copyright">© 2025 Electrónica Store</p>
    </div>
  </aside>
</template>

<script setup>
import { useUserStore } from "@/store/user";
import { computed } from "vue";

const userStore = useUserStore();
const rol = computed(() => userStore.user?.rol || userStore.user?.role);
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: 0 0 50% 50%;
  z-index: 0;
}

/* Header */
.sidebar-header {
  padding: 24px 20px;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  padding-left: 52px;
  font-weight: 500;
}

/* User Card */
.user-card {
  margin: 0 16px 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-transform: capitalize;
  font-weight: 500;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.nav-section {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 12px 12px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-link:hover::before {
  transform: scaleY(1);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  color: white;
  font-weight: 600;
}

.nav-link.router-link-active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.nav-arrow {
  font-size: 18px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(-8px);
}

.nav-link:hover .nav-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Footer */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.footer-stats {
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.stat-icon {
  color: #22c55e;
  font-size: 14px;
}

.stat-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.footer-copyright {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  margin: 0;
  font-weight: 500;
}
</style>