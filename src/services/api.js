import axios from "axios";
import { useUserStore } from "@/store/user";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// 👉 Middleware para añadir token a cada request
api.interceptors.request.use((config) => {
  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token en request:", token);
  } else {
    console.warn("⚠️ No se encontró token en userStore ni en localStorage");
  }

  return config;
});

export default api;
