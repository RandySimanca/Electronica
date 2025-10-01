import axios from "axios";
import { useUserStore } from "@/store/user";

// 🔧 Detectar automáticamente el ambiente
const getBaseURL = () => {
  // Si estamos en producción (cualquier dominio que no sea localhost)
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    return '/api'; // Ruta relativa para producción
  }
  // En desarrollo local
  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// 👉 Interceptor para añadir token a cada request
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token agregado al request");
    } else {
      // Solo mostrar warning si NO es login o register
      const isAuthRoute = config.url.includes('/auth/login') || 
                         config.url.includes('/auth/register');
      
      if (!isAuthRoute) {
        console.warn("⚠️ No se encontró token");
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// 👉 Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Respuesta exitosa
    return response;
  },
  (error) => {
    // Manejo de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error("❌ No autorizado - Token inválido o expirado");
          // Limpiar token inválido
          localStorage.removeItem("token");
          const userStore = useUserStore();
          userStore.token = null;
          // Opcional: redirigir al login
          // window.location.href = '/login';
          break;
          
        case 403:
          console.error("❌ Acceso prohibido");
          break;
          
        case 404:
          console.error("❌ Recurso no encontrado");
          break;
          
        case 500:
          console.error("❌ Error del servidor");
          break;
          
        default:
          console.error(`❌ Error ${status}:`, data.message || error.message);
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error("❌ No hay respuesta del servidor:", error.message);
      console.error("🔍 Verifica que el backend esté corriendo");
    } else {
      // Algo pasó al configurar la petición
      console.error("❌ Error al configurar la petición:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// 🐛 Debug: Mostrar baseURL en consola
console.log("🌐 API Base URL:", api.defaults.baseURL);

export default api;