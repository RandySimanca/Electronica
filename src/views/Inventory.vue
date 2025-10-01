<template>
  <div class="inventory-container">
    <h1 class="title">Gestión de Inventario</h1>

    <!-- Buscador -->
    <div class="search-container">
      <input v-model="searchQuery" placeholder="Buscar productos..." class="search-input" />
    </div>

    <!-- Formulario para agregar producto -->
    <form class="product-form" @submit.prevent="addProduct">
      <div class="form-group full">
        <label for="name">Nombre del producto</label>
        <input id="name" v-model="newProduct.name" placeholder="Ej: Mouse inalámbrico" required />
      </div>

      <div class="form-group small">
        <label for="stock">Stock</label>
        <input id="stock" type="number" v-model.number="newProduct.stock" placeholder="Ej: 10" required />
      </div>

      <div class="form-group small">
        <label for="price">Precio</label>
        <input id="price" type="number" v-model.number="newProduct.price" placeholder="Ej: 30000" required />
      </div>

      <div class="form-group small">
        <label for="min_stock">Stock mínimo</label>
        <input id="min_stock" type="number" v-model.number="newProduct.min_stock" placeholder="Ej: 2" />
      </div>

      <button type="submit">Agregar</button>
    </form>

    <!-- Tabla de productos -->
    <table class="product-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Stock</th>
          <th>Precio</th>
          <th>Stock mínimo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in filteredProducts" :key="i">
          <td v-if="editingProduct?.id !== item.id">{{ item.name }}</td>
          <td v-else><input v-model="editingProduct.name" /></td>

          <td v-if="editingProduct?.id !== item.id">{{ item.stock }}</td>
          <td v-else><input type="number" v-model.number="editingProduct.stock" /></td>

          <td v-if="editingProduct?.id !== item.id">{{ item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</td>
          <td v-else><input type="number" v-model.number="editingProduct.price" /></td>

          <td v-if="editingProduct?.id !== item.id">{{ item.min_stock }}</td>
          <td v-else><input type="number" v-model.number="editingProduct.min_stock" /></td>

          <td>
            <button v-if="editingProduct?.id !== item.id" @click="startEdit(item)" class="edit-btn">Editar</button>
            <button v-else @click="saveEdit" class="save-btn">Guardar</button>
            <button v-if="editingProduct?.id !== item.id" @click="cancelEdit" class="cancel-btn">Cancelar</button>
            <button @click="deleteProduct(item.id)" class="delete-btn">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";

const products = ref([]);
const searchQuery = ref("");
const editingProduct = ref(null);
const newProduct = ref({
  name: "",
  stock: 0,
  price: 0,
  min_stock: 0,
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const loadProducts = async () => {
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
};

const addProduct = async () => {
  try {
    if (!newProduct.value.name || newProduct.value.price === null) {
      alert("Nombre y precio son obligatorios");
      return;
    }

    await api.post("/products", {
      name: newProduct.value.name,
      stock: newProduct.value.stock || 0,
      price: newProduct.value.price || 0,
      min_stock: newProduct.value.min_stock || 0,
    });

    await loadProducts();
    newProduct.value = { name: "", stock: "", price: "", min_stock: "" };
  } catch (err) {
    console.error("Error al crear producto:", err);
    alert(err.response?.data?.error || "Error al crear producto");
  }
};

const startEdit = (product) => {
  editingProduct.value = { ...product };
};

const saveEdit = async () => {
  try {
    await api.put(`/products/${editingProduct.value.id}`, {
      name: editingProduct.value.name,
      stock: editingProduct.value.stock,
      price: editingProduct.value.price,
      min_stock: editingProduct.value.min_stock,
    });
    await loadProducts();
    editingProduct.value = null;
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    alert(err.response?.data?.error || "Error al actualizar producto");
  }
};

const cancelEdit = () => {
  editingProduct.value = null;
};

const deleteProduct = async (id) => {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
  try {
    await api.delete(`/products/${id}`);
    await loadProducts();
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    alert(err.response?.data?.error || "Error al eliminar producto");
  }
};

onMounted(loadProducts);
</script>

<style scoped>
.inventory-container {
  max-width: 1000px;
  margin: 2rem auto;
  background: #fdfdfd;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #2c3e50;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.product-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  flex: 1 1 100%;
}

.form-group.small {
  flex: 1 1 120px;
}

.product-form input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.product-form label {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  color: #34495e;
}

.product-form button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.product-form button:hover {
  background-color: #2980b9;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.product-table th {
  background-color: #34495e;
  color: white;
  padding: 0.75rem;
  text-align: left;
}

.product-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

.product-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.product-table input {
  width: 100%;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-btn, .save-btn, .cancel-btn, .delete-btn {
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.edit-btn:hover {
  background-color: #e67e22;
}

.save-btn {
  background-color: #27ae60;
  color: white;
}

.save-btn:hover {
  background-color: #229954;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}
</style>
