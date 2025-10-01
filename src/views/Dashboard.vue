<template>
  <div v-if="userStore.user && rol" class="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
    
    <!-- Contenido principal -->
    <main class="flex-1 p-10 overflow-y-auto">
      
      <!-- Header con user info -->
      <div class="flex justify-between items-center mb-10">
        <h2 class="text-3xl font-bold text-white drop-shadow">
          Bienvenido 👋
        </h2>
        <div class="flex items-center gap-4 bg-white/10 px-5 py-2 rounded-full shadow-lg backdrop-blur-md">
          <div class="text-white">
            <p class="font-semibold">{{ userStore.user.nombre || userStore.user.username }}</p>
           <!--<p class="text-sm opacity-80 capitalize">{{ rol }}</p>-->
          </div>
        </div>
      </div>

      <!-- Tarjeta Principal con toda la información -->
      <div class="card-container animate-fade-in">
        <div class="card-header">
          <h3 class="text-2xl font-bold text-gray-800">Panel de Control</h3>
          <p class="text-gray-600 mt-1">Información completa de tu cuenta</p>
        </div>

        <!-- Grid de información -->
        <div class="info-grid">
          
          <!-- Información Personal -->
          <div class="info-card">
            <div class="icon-circle bg-gradient-to-br from-indigo-500 to-purple-600">
              <span class="text-2xl">👤</span>
            </div>
            <h4 class="card-title">Información Personal</h4>
            <div class="card-content">
              <div class="data-row">
                <span class="data-label">Nombre</span>
                <span class="data-value">{{ userStore.user.nombre || userStore.user.username }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Email</span>
                <span class="data-value">{{ userStore.user.email }}</span>
              </div>
            </div>
          </div>

          <!-- Rol -->
          <div class="info-card">
            <div class="icon-circle bg-gradient-to-br from-purple-500 to-pink-600">
              <span class="text-2xl">🎓</span>
            </div>
            <h4 class="card-title">Rol</h4>
            <div class="card-content">
              <div class="role-badge">
                <span class="capitalize">{{ rol }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Acceso completo al sistema</p>
            </div>
          </div>

          <!-- Tipo de Técnico (solo si es técnico Y tiene especialidad) -->
          <div class="info-card" v-if="isTechnician && specialty">
            <div class="icon-circle bg-gradient-to-br from-cyan-500 to-blue-600">
              <span class="text-2xl">{{ specialtyIcon }}</span>
            </div>
            <h4 class="card-title">Especialidad</h4>
            <div class="card-content">
              <div class="tech-badge">
                <span class="capitalize">{{ specialtyName }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Área de especialización</p>
            </div>
          </div>

          <!-- Mensaje si es técnico pero no tiene especialidad asignada -->
          <div class="info-card" v-if="isTechnician && !specialty">
            <div class="icon-circle bg-gradient-to-br from-amber-500 to-orange-600">
              <span class="text-2xl">⚠️</span>
            </div>
            <h4 class="card-title">Especialidad</h4>
            <div class="card-content">
              <div class="warning-badge">
                <span>No asignada</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Contacta al administrador para asignar tu especialidad</p>
            </div>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
import { computed } from "vue";

const userStore = useUserStore();

// Computed properties
const rol = computed(() => {
  return userStore.user?.rol || userStore.user?.role;
});

const isTechnician = computed(() => {
  const userRole = rol.value?.toLowerCase();
  return userRole === 'tecnico' || userRole === 'técnico';
});

const specialty = computed(() => {
  if (!userStore.user) return null;
  
  return userStore.user.section || 
         userStore.user.tipoTecnico || 
         userStore.user.tipo_tecnico || 
         userStore.user.especialidad ||
         userStore.user.technician_type ||
         userStore.user.tipo ||
         null;
});

const specialtyIcon = computed(() => {
  const tipo = specialty.value?.toLowerCase();
  
  const icons = {
    'sistemas': '💻',
    'celulares': '📱',
    'electronica': '⚡',
    'electronico': '⚡'
  };
  
  return icons[tipo] || '🔧';
});

const specialtyName = computed(() => {
  const tipo = specialty.value?.toLowerCase();
  
  const specialties = {
    'sistemas': 'Sistemas',
    'celulares': 'Celulares',
    'electronica': 'Electrónica',
    'electronico': 'Electrónica'
  };
  
  return specialties[tipo] || specialty.value || 'No especificado';
});
</script>

<style scoped>
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(25px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.7s ease-out both;
}

/* Contenedor de la tarjeta principal */
.card-container {
  background: rgb(3, 133, 153);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

/* Grid de información */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Tarjetas individuales dentro del grid */
.info-card {
  background: linear-gradient(135deg, rgba(181, 228, 247, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 5px 10px -5px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.info-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.8);
}

/* Círculo de ícono */
.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.info-card:hover .icon-circle {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 12px 24px -2px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.5);
}

/* Título de la tarjeta */
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

/* Contenido de la tarjeta */
.card-content {
  margin-top: 12px;
}

/* Filas de datos */
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.data-row:last-child {
  border-bottom: none;
}

.data-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.data-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badge de rol */
.role-badge {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  padding: 12px 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #9333ea;
}

/* Badge de técnico */
.tech-badge {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  padding: 12px 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #0891b2;
}

/* Badge de advertencia */
.warning-badge {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%);
  padding: 12px 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
}
</style>