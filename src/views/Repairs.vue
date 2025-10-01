<template>
  <div class="container">
    <h1>📋 Recepción de Reparaciones</h1>

    <div class="form-card">
      <h2>Registrar Nueva Reparación</h2>
      
      <form @submit.prevent="handleSubmit">
        <!-- Información del Cliente -->
        <div class="section-header">
          <h3>👤 Información del Cliente</h3>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nombre del Cliente:</label>
            <input 
              v-model="repair.client_name" 
              placeholder="Nombre completo" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Teléfono:</label>
            <input 
              v-model="repair.client_phone" 
              placeholder="300 123 4567" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label>Documento (Opcional):</label>
          <input 
            v-model="repair.client_doc" 
            placeholder="CC, NIT, etc." 
          />
        </div>

        <!-- Información del Equipo -->
        <div class="section-header">
          <h3>🔧 Información del Equipo</h3>
        </div>

        <div class="form-group">
          <label>Dispositivo:</label>
          <input 
            v-model="repair.device" 
            placeholder="Ej: iPhone 12, HP Pavilion, TV Samsung 55'"
            required 
          />
        </div>

        <div class="form-group">
          <label>Problema Reportado:</label>
          <textarea 
            v-model="repair.issue_description" 
            placeholder="Describe detalladamente el problema del equipo"
            rows="3"
            required
          ></textarea>
        </div>

        <!-- Asignación -->
        <div class="section-header">
          <h3>👨‍🔧 Asignación</h3>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Sección:</label>
            <select v-model="repair.section" @change="loadTechnicians" required>
              <option value="">Seleccione una sección</option>
              <option value="electronica">📺 Electrónica</option>
              <option value="sistemas">💻 Sistemas</option>
              <option value="celulares">📱 Celulares</option>
            </select>
          </div>

          <div class="form-group" v-if="repair.section">
            <label>Técnico Asignado:</label>
            <select v-model="repair.assigned_to" required>
              <option value="">Seleccione un técnico</option>
              <option v-for="tech in technicians" :key="tech.id" :value="tech.id">
                {{ tech.name }}
              </option>
            </select>
            <small v-if="technicians.length === 0" class="text-warning">
              ⚠️ No hay técnicos disponibles en esta sección
            </small>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '⏳ Registrando...' : '✅ Registrar Reparación' }}
        </button>
      </form>
    </div>

    <!-- Lista de Reparaciones -->
    <div class="repairs-list">
      <div class="list-header">
        <h2>📝 Reparaciones Registradas</h2>
        <div class="filter-buttons">
          <button 
            :class="['filter-btn', { active: filter === 'all' }]"
            @click="filter = 'all'"
          >
            Todas ({{ repairs.length }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'pendiente' }]"
            @click="filter = 'pendiente'"
          >
            Pendientes ({{ pendingCount }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'en_proceso' }]"
            @click="filter = 'en_proceso'"
          >
            En Proceso ({{ inProgressCount }})
          </button>
          <button 
            :class="['filter-btn', { active: filter === 'completada' }]"
            @click="filter = 'completada'"
          >
            Completadas ({{ completedCount }})
          </button>
        </div>
      </div>
      
      <div v-if="filteredRepairs.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No hay reparaciones {{ filter === 'all' ? 'registradas' : formatStatus(filter) }}</p>
      </div>

      <div v-else class="repairs-grid">
        <div v-for="r in filteredRepairs" :key="r.id" class="repair-card">
          <div class="repair-header">
            <span class="repair-id">#{{ r.id }}</span>
            <span :class="['status', r.status]">{{ formatStatus(r.status) }}</span>
          </div>
          
          <div class="repair-info">
            <div class="info-row">
              <span class="label">👤 Cliente:</span>
              <span class="value">{{ r.client_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">📞 Teléfono:</span>
              <span class="value">{{ r.client_phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">🔧 Dispositivo:</span>
              <span class="value">{{ r.device }}</span>
            </div>
            <div class="info-row">
              <span class="label">⚠️ Problema:</span>
              <span class="value">{{ r.issue_description }}</span>
            </div>
            <div class="info-row">
              <span class="label">📂 Sección:</span>
              <span class="value">{{ formatSection(r.section) }}</span>
            </div>
            <div class="info-row">
              <span class="label">👨‍🔧 Técnico:</span>
              <span class="value">{{ r.technician_name || 'No asignado' }}</span>
            </div>
            <div class="info-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">{{ formatDate(r.created_at) }}</span>
            </div>
          </div>

          <div v-if="r.diagnosis" class="diagnosis">
            <strong>🔍 Diagnóstico:</strong>
            <p>{{ r.diagnosis }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";

const technicians = ref([]);
const repairs = ref([]);
const loading = ref(false);
const filter = ref('all');

const repair = ref({
  client_name: "",
  client_phone: "",
  client_doc: "",
  device: "",
  issue_description: "",
  section: "",
  assigned_to: ""
});

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
  if (filter.value === 'all') return repairs.value;
  return repairs.value.filter(r => r.status === filter.value);
});

async function loadTechnicians() {
  if (!repair.value.section) {
    technicians.value = [];
    return;
  }

  try {
    const { data } = await api.get(`/repairs/technicians/${repair.value.section}`);
    technicians.value = Array.isArray(data) ? data : [];
    repair.value.assigned_to = "";
  } catch (error) {
    console.error("Error:", error.response?.data);
    alert(error.response?.data?.error || "Error al cargar técnicos");
    technicians.value = [];
  }
}

async function loadRepairs() {
  try {
    const { data } = await api.get('/repairs');
    repairs.value = data;
  } catch (error) {
    console.error("Error al cargar reparaciones:", error);
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    await api.post('/repairs', repair.value);
    alert("✅ Reparación registrada exitosamente");
    
    repair.value = {
      client_name: "",
      client_phone: "",
      client_doc: "",
      device: "",
      issue_description: "",
      section: "",
      assigned_to: ""
    };
    technicians.value = [];
    loadRepairs();
  } catch (error) {
    console.error("Error al registrar reparación:", error);
    alert(error.response?.data?.error || "Error al registrar la reparación");
  } finally {
    loading.value = false;
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

function formatSection(section) {
  const sectionMap = {
    electronica: "📺 Electrónica",
    sistemas: "💻 Sistemas",
    celulares: "📱 Celulares"
  };
  return sectionMap[section] || section;
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

h1 {
  color: #2c3e50;
  margin-bottom: 25px;
}

.form-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.form-card h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
}

.section-header {
  margin: 25px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.text-warning {
  color: #856404;
  font-size: 12px;
  margin-top: 5px;
  display: block;
  background: #fff3cd;
  padding: 5px 8px;
  border-radius: 4px;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  width: 100%;
  margin-top: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.repairs-list {
  margin-top: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h2 {
  margin: 0;
  color: #2c3e50;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
  color: #495057;
}

.filter-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

.repairs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.repair-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.repair-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.repair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.repair-id {
  font-weight: 700;
  color: #495057;
  font-size: 15px;
}

.status {
  padding: 5px 14px;
  border-radius: 15px;
  font-size: 12px;
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

.repair-info {
  padding: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.info-row .label {
  min-width: 110px;
  font-weight: 500;
  color: #6c757d;
}

.info-row .value {
  flex: 1;
  color: #212529;
}

.diagnosis {
  margin: 0 20px 20px 20px;
  padding: 15px;
  background: #e7f3ff;
  border-left: 4px solid #007bff;
  border-radius: 6px;
}

.diagnosis strong {
  display: block;
  margin-bottom: 8px;
  color: #0056b3;
  font-size: 14px;
}

.diagnosis p {
  margin: 0;
  color: #333;
  line-height: 1.6;
  font-size: 13px;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    min-width: 0;
  }
  
  .repairs-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>