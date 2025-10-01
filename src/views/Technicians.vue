<template>
  <div class="container">
    <h1>🔧 Panel de Técnico</h1>

    <div class="stats-bar">
      <div class="stat-card">
        <span class="stat-number">{{ pendingCount }}</span>
        <span class="stat-label">Pendientes</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ inProgressCount }}</span>
        <span class="stat-label">En Proceso</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ completedCount }}</span>
        <span class="stat-label">Completadas</span>
      </div>
    </div>

    <div class="filters">
      <button 
        :class="['filter-btn', { active: activeFilter === 'all' }]"
        @click="activeFilter = 'all'"
      >
        Todas
      </button>
      <button 
        :class="['filter-btn', { active: activeFilter === 'pendiente' }]"
        @click="activeFilter = 'pendiente'"
      >
        Pendientes
      </button>
      <button 
        :class="['filter-btn', { active: activeFilter === 'en_proceso' }]"
        @click="activeFilter = 'en_proceso'"
      >
        En Proceso
      </button>
      <button 
        :class="['filter-btn', { active: activeFilter === 'completada' }]"
        @click="activeFilter = 'completada'"
      >
        Completadas
      </button>
    </div>

    <div v-if="filteredRepairs.length === 0" class="empty-state">
      No tienes reparaciones {{ activeFilter === 'all' ? 'asignadas' : formatStatus(activeFilter) }}
    </div>

    <div v-else class="repairs-list">
      <div v-for="repair in filteredRepairs" :key="repair.id" class="repair-card">
        <div class="repair-header">
          <div>
            <span class="repair-id">#{{ repair.id }}</span>
            <span class="device">{{ repair.device }}</span>
          </div>
          <span :class="['status', repair.status]">{{ formatStatus(repair.status) }}</span>
        </div>

        <div class="repair-body">
          <div class="info-section">
            <p><strong>Cliente:</strong> {{ repair.client_name }}</p>
            <p><strong>Teléfono:</strong> {{ repair.client_phone }}</p>
            <p><strong>Problema Reportado:</strong></p>
            <p class="issue">{{ repair.issue_description }}</p>
            <p class="date">Recibido: {{ formatDate(repair.created_at) }}</p>
          </div>

          <div v-if="repair.diagnosis" class="diagnosis-box">
            <strong>📋 Diagnóstico:</strong>
            <p>{{ repair.diagnosis }}</p>
          </div>

          <div v-if="repair.status !== 'completada'" class="diagnosis-form">
            <label>{{ repair.diagnosis ? 'Actualizar Diagnóstico:' : 'Agregar Diagnóstico:' }}</label>
            <textarea 
              v-model="diagnosisInputs[repair.id]"
              :placeholder="repair.diagnosis || 'Describe el diagnóstico técnico...'"
              rows="3"
            ></textarea>
            <button 
              @click="saveDiagnosis(repair.id)" 
              class="btn-primary"
              :disabled="!diagnosisInputs[repair.id]"
            >
              Guardar Diagnóstico
            </button>
          </div>

          <div class="actions">
            <button 
              v-if="repair.status === 'pendiente'" 
              @click="updateStatus(repair.id, 'en_proceso')"
              class="btn-action btn-process"
            >
              ▶️ Iniciar Reparación
            </button>
            
            <button 
              v-if="repair.status === 'en_proceso'" 
              @click="updateStatus(repair.id, 'completada')"
              class="btn-action btn-complete"
            >
              ✅ Marcar como Completada
            </button>

            <button 
              v-if="repair.status === 'en_proceso'" 
              @click="updateStatus(repair.id, 'pendiente')"
              class="btn-action btn-secondary"
            >
              ⏸️ Pausar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";

const repairs = ref([]);
const activeFilter = ref('all');
const diagnosisInputs = ref({});

const pendingCount = computed(() => 
  repairs.value.filter(r => r.status === 'pendiente').length
);
const inProgressCount = computed(() => 
  repairs.value.filter(r => r.status === 'en_proceso').length
);
const completedCount = computed(() => 
  repairs.value.filter(r => r.status === 'completada').length
);

const filteredRepairs = computed(() => {
  if (activeFilter.value === 'all') return repairs.value;
  return repairs.value.filter(r => r.status === activeFilter.value);
});

async function loadRepairs() {
  try {
    const { data } = await api.get('/repairs');
    repairs.value = data;
    
    data.forEach(repair => {
      if (!diagnosisInputs.value[repair.id]) {
        diagnosisInputs.value[repair.id] = repair.diagnosis || "";
      }
    });
  } catch (error) {
    console.error("Error al cargar reparaciones:", error);
    alert("Error al cargar tus reparaciones asignadas");
  }
}

async function saveDiagnosis(repairId) {
  const diagnosis = diagnosisInputs.value[repairId];
  
  if (!diagnosis || diagnosis.trim() === "") {
    alert("Por favor escribe un diagnóstico");
    return;
  }

  try {
    await api.put(`/repairs/${repairId}/diagnosis`, { diagnosis });
    alert("✅ Diagnóstico guardado exitosamente");
    loadRepairs();
  } catch (error) {
    console.error("Error al guardar diagnóstico:", error);
    alert(error.response?.data?.error || "Error al guardar el diagnóstico");
  }
}

async function updateStatus(repairId, newStatus) {
  try {
    await api.put(`/repairs/${repairId}/status`, { status: newStatus });
    alert(`✅ Estado actualizado a: ${formatStatus(newStatus)}`);
    loadRepairs();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    alert(error.response?.data?.error || "Error al actualizar el estado");
  }
}

function formatStatus(status) {
  const statusMap = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    completada: "Completada"
  };
  return statusMap[status] || status;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadRepairs();
});
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #007bff;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
  background: white;
  border-radius: 8px;
}

.repairs-list {
  display: grid;
  gap: 20px;
}

.repair-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.repair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.repair-header > div {
  display: flex;
  gap: 15px;
  align-items: center;
}

.repair-id {
  font-weight: bold;
  color: #495057;
  font-size: 14px;
}

.device {
  font-weight: 600;
  color: #212529;
  font-size: 16px;
}

.status {
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
}

.status.pendiente {
  background: #fff3cd;
  color: #856404;
}

.status.en_proceso {
  background: #d1ecf1;
  color: #0c5460;
}

.status.completada {
  background: #d4edda;
  color: #155724;
}

.repair-body {
  padding: 20px;
}

.info-section p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.issue {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
  font-style: italic;
  color: #495057;
}

.date {
  color: #6c757d;
  font-size: 13px;
  margin-top: 10px;
}

.diagnosis-box {
  margin-top: 20px;
  padding: 15px;
  background: #e7f3ff;
  border-left: 4px solid #007bff;
  border-radius: 4px;
}

.diagnosis-box strong {
  display: block;
  margin-bottom: 8px;
  color: #0056b3;
}

.diagnosis-box p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.diagnosis-form {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.diagnosis-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.diagnosis-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
}

.diagnosis-form textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-process {
  background: #17a2b8;
  color: white;
}

.btn-process:hover {
  background: #138496;
}

.btn-complete {
  background: #28a745;
  color: white;
}

.btn-complete:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
  
  .repair-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
  }
}
</style>