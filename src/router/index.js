import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import Dashboard from "@/views/Dashboard.vue";
import Inventory from "@/views/Inventory.vue";
import Users from "@/views/Users.vue";
import Sales from "@/views/Sales.vue";
import Repairs from "@/views/Repairs.vue";
import Technicians from "@/views/Technicians.vue";
import { useUserStore } from "@/store/user";

const routes = [
  { path: "/", component: LoginForm },
  { path: "/register", component: RegisterForm },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/inventory",
    component: Inventory,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/users",
    component: Users,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/sales",
    component: Sales,
    meta: { requiresAuth: true, role: "vendedor" },
  },
  {
    path: "/repairs",
    component: Repairs,
    meta: { requiresAuth: true, role: "vendedor" },
  },
  {
    path: "/technicians",
    component: Technicians,
    meta: { requiresAuth: true, role: "tecnico" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.user) {
    next("/");
  } else if (to.meta.role && (userStore.user.rol || userStore.user.role) !== to.meta.role) {
    next("/dashboard");
  } else {
    next();
  }
});


export default router;
