<template>
  <div class="sales-container">
    <div class="main-layout">
      <!-- Sección de búsqueda y productos -->
      <div class="products-sidebar">
        <h2>Productos</h2>
        <input 
          v-model="searchQuery" 
          placeholder="🔍 Buscar producto..." 
          class="search-input" 
        />
        <div class="products-list">
          <div 
            v-for="(product, i) in filteredProducts" 
            :key="i" 
            class="product-card"
            @click="selectProduct(product)"
          >
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p class="price">{{ product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</p>
              <p class="stock">Stock: {{ product.stock }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Factura principal -->
      <div class="invoice-section">
        <div class="invoice-header">
          <div class="company-info">
            <h1>FACTURA DE VENTA</h1>
            <p>Tu Empresa S.A.S</p>
            <p>NIT: 900.123.456-7</p>
          </div>
          <div class="invoice-number">
            <h2>No. {{ nextInvoiceNumber }}</h2>
            <p>{{ currentDate }}</p>
          </div>
        </div>

        <div class="customer-info">
          <div class="info-group">
            <label>Cliente:</label>
            <input v-model="customerName" placeholder="Nombre del cliente" />
          </div>
          <div class="info-group">
            <label>Documento:</label>
            <input v-model="customerDoc" placeholder="CC/NIT" />
          </div>
        </div>

        <!-- Modal para cantidad -->
        <div v-if="selectedProduct" class="quantity-modal">
          <div class="modal-content">
            <h3>{{ selectedProduct.name }}</h3>
            <p>Precio: {{ selectedProduct.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</p>
            <p>Stock disponible: {{ selectedProduct.stock }}</p>
            <div class="quantity-input">
              <label>Cantidad:</label>
              <input 
                type="number" 
                v-model.number="tempQuantity" 
                min="1" 
                :max="selectedProduct.stock"
                @keyup.enter="confirmAddToCart"
              />
            </div>
            <div class="modal-actions">
              <button @click="confirmAddToCart" class="btn-confirm">Agregar</button>
              <button @click="selectedProduct = null" class="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>

        <!-- Tabla de productos en factura -->
        <div class="invoice-items">
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cart.length === 0">
                <td colspan="6" class="empty-invoice">
                  Seleccione productos para agregar a la factura
                </td>
              </tr>
              <tr v-for="(item, i) in cart" :key="i">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</td>
                <td>{{ (item.price * item.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</td>
                <td>
                  <button @click="removeFromCart(i)" class="btn-remove">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="invoice-totals">
          <div class="totals-grid">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>{{ subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
            </div>
            <div class="total-row">
              <span>IVA (19%):</span>
              <span>{{ iva.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
            </div>
            <div class="total-row total-final">
              <span>TOTAL:</span>
              <span>{{ total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
            </div>
          </div>
        </div>

        <!-- Forma de pago y acciones -->
        <div class="invoice-footer">
          <div class="payment-method">
            <label>Método de Pago:</label>
            <select v-model="paymentMethod">
              <option value="efectivo">💵 Efectivo</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="transferencia">🏦 Transferencia</option>
            </select>
          </div>
          <div class="action-buttons">
            <button @click="clearCart" class="btn-clear">Limpiar</button>
            <button @click="sellCart" :disabled="cart.length === 0" class="btn-sell">
              💰 Procesar Venta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Historial de ventas -->
    <div class="sales-history">
      <h2>📋 Historial de Ventas</h2>
      <div class="history-list">
        <div v-for="(sale, i) in sales" :key="i" class="sale-item">
          <div class="sale-header">
            <span class="sale-number">Factura #{{ sale.id }}</span>
            <span class="sale-date">{{ new Date(sale.created_at).toLocaleString('es-CO') }}</span>
          </div>
          <div class="sale-details">
            <span>Total: {{ sale.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
            <span class="payment-badge">{{ sale.payment_method }}</span>
            <button @click="viewInvoice(sale)" class="btn-view">🖨️ Ver/Imprimir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de impresión de factura -->
    <div v-if="invoiceToPrint" class="print-modal" @click.self="invoiceToPrint = null">
      <div class="print-content">
        <div class="print-header no-print">
          <h2>Vista Previa de Factura</h2>
          <button @click="invoiceToPrint = null" class="btn-close">✕</button>
        </div>
        
        <div id="printable-invoice" class="printable-invoice">
          <div class="invoice-print-header">
            <div class="company-section">
              <h1>Tu Empresa S.A.S</h1>
              <p>NIT: 900.123.456-7</p>
              <p>Dirección: Calle 123 #45-67</p>
              <p>Teléfono: (601) 123-4567</p>
              <p>Email: ventas@tuempresa.com</p>
            </div>
            <div class="invoice-info-section">
              <h2>FACTURA DE VENTA</h2>
              <p><strong>No. {{ invoiceToPrint.id }}</strong></p>
              <p>{{ new Date(invoiceToPrint.created_at).toLocaleString('es-CO') }}</p>
            </div>
          </div>

          <div class="customer-section">
            <h3>Información del Cliente</h3>
            <p><strong>Cliente:</strong> {{ invoiceToPrint.customer_name || 'Cliente General' }}</p>
            <p><strong>Documento:</strong> {{ invoiceToPrint.customer_doc || 'N/A' }}</p>
          </div>

          <table class="print-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cant.</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in invoiceToPrint.items" :key="i">
                <td>{{ item.product_id }}</td>
                <td>{{ item.product_name || 'Producto' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</td>
                <td>{{ (item.price * item.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="print-totals">
            <div class="totals-section">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>{{ calculateSubtotal(invoiceToPrint.items).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
              </div>
              <div class="total-line">
                <span>IVA (19%):</span>
                <span>{{ calculateIVA(invoiceToPrint.items).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</span>
              </div>
              <div class="total-line final-total">
                <span><strong>TOTAL:</strong></span>
                <span><strong>{{ invoiceToPrint.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</strong></span>
              </div>
            </div>
          </div>

          <div class="payment-info">
            <p><strong>Método de Pago:</strong> {{ formatPaymentMethod(invoiceToPrint.payment_method) }}</p>
          </div>

          <div class="invoice-footer-print">
            <p>¡Gracias por su compra!</p>
            <p>Esta factura es un documento válido para efectos tributarios</p>
          </div>
        </div>

        <div class="print-actions no-print">
          <button @click="printInvoice" class="btn-print">🖨️ Imprimir</button>
          <button @click="invoiceToPrint = null" class="btn-cancel">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";

const products = ref([]);
const sales = ref([]);
const cart = ref([]);
const paymentMethod = ref("efectivo");
const searchQuery = ref("");
const customerName = ref("");
const customerDoc = ref("");
const selectedProduct = ref(null);
const tempQuantity = ref(1);
const invoiceToPrint = ref(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const nextInvoiceNumber = computed(() => {
  return sales.value.length > 0 ? Math.max(...sales.value.map(s => s.id)) + 1 : 1;
});

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const iva = computed(() => {
  return subtotal.value * 0.19;
});

const total = computed(() => {
  return subtotal.value + iva.value;
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value.slice(0, 20);
  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 20);
});

const loadProducts = async () => {
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
};

const loadSales = async () => {
  try {
    const res = await api.get("/sales");
    sales.value = res.data;
  } catch (err) {
    console.error("Error al cargar ventas:", err);
  }
};

onMounted(() => {
  loadProducts();
  loadSales();
});

function selectProduct(product) {
  selectedProduct.value = product;
  tempQuantity.value = 1;
}

function confirmAddToCart() {
  const product = selectedProduct.value;
  const qty = tempQuantity.value;
  
  if (!qty || qty <= 0 || qty > product.stock) {
    alert("Cantidad inválida o stock insuficiente");
    return;
  }

  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty
    });
  }

  selectedProduct.value = null;
}

function removeFromCart(index) {
  cart.value.splice(index, 1);
}

function clearCart() {
  if (cart.value.length > 0 && confirm("¿Está seguro de limpiar la factura?")) {
    cart.value = [];
    customerName.value = "";
    customerDoc.value = "";
  }
}

async function sellCart() {
  if (cart.value.length === 0) return;

  if (!customerName.value) {
    alert("Por favor ingrese el nombre del cliente");
    return;
  }

  try {
    const items = cart.value.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    await api.post("/sales", {
      items: items,
      total: total.value,
      payment_method: paymentMethod.value,
      customer_name: customerName.value,
      customer_doc: customerDoc.value
    });

    alert("✅ Venta procesada exitosamente");
    cart.value = [];
    customerName.value = "";
    customerDoc.value = "";
    await loadProducts();
    await loadSales();
  } catch (err) {
    console.error("Error al realizar venta:", err);
    alert(err.response?.data?.error || "Error al realizar venta");
  }
}

function viewInvoice(sale) {
  invoiceToPrint.value = sale;
}

function printInvoice() {
  window.print();
}

function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateIVA(items) {
  return calculateSubtotal(items) * 0.19;
}

function formatPaymentMethod(method) {
  const methods = {
    'efectivo': '💵 Efectivo',
    'tarjeta': '💳 Tarjeta',
    'transferencia': '🏦 Transferencia'
  };
  return methods[method] || method;
}
</script>

<style scoped>
.sales-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.products-sidebar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
}

.products-sidebar h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.products-list {
  overflow-y: auto;
  flex: 1;
}

.product-card {
  background: #f8f9fa;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.product-card:hover {
  background: #e3f2fd;
  border-color: #3498db;
  transform: translateX(5px);
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.product-info .price {
  color: #27ae60;
  font-weight: bold;
  margin: 0.25rem 0;
}

.product-info .stock {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.quantity-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 350px;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.quantity-input {
  margin: 1.5rem 0;
}

.quantity-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.quantity-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-confirm, .btn-cancel {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-confirm {
  background: #27ae60;
  color: white;
}

.btn-confirm:hover {
  background: #229954;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.invoice-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid #3498db;
  margin-bottom: 1.5rem;
}

.company-info h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.company-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}

.invoice-number {
  text-align: right;
}

.invoice-number h2 {
  margin: 0;
  color: #3498db;
  font-size: 1.8rem;
}

.invoice-number p {
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
}

.customer-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-group label {
  display: block;
  font-weight: bold;
  color: #555;
  margin-bottom: 0.5rem;
}

.info-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.invoice-items {
  margin: 1.5rem 0;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table thead {
  background: #34495e;
  color: white;
}

.invoice-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
}

.invoice-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.invoice-table tbody tr:hover {
  background: #f8f9fa;
}

.empty-invoice {
  text-align: center;
  color: #95a5a6;
  font-style: italic;
  padding: 2rem !important;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-remove:hover {
  background: #c0392b;
}

.invoice-totals {
  display: flex;
  justify-content: flex-end;
  margin: 1.5rem 0;
}

.totals-grid {
  min-width: 350px;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.total-final {
  border-top: 2px solid #34495e;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.4rem;
  font-weight: bold;
  color: #27ae60;
}

.invoice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-method label {
  font-weight: bold;
  color: #555;
}

.payment-method select {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn-clear, .btn-sell {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear {
  background: #95a5a6;
  color: white;
}

.btn-clear:hover {
  background: #7f8c8d;
}

.btn-sell {
  background: #27ae60;
  color: white;
}

.btn-sell:hover:not(:disabled) {
  background: #229954;
  transform: scale(1.05);
}

.btn-sell:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.sales-history {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sales-history h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.history-list {
  display: grid;
  gap: 0.75rem;
}

.sale-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.sale-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.sale-number {
  font-weight: bold;
  color: #2c3e50;
}

.sale-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.sale-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-badge {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.btn-view {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-view:hover {
  background: #2980b9;
  transform: scale(1.05);
}

.print-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.print-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.print-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: #e74c3c;
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #c0392b;
  transform: rotate(90deg);
}

.printable-invoice {
  padding: 2rem;
  background: white;
  max-width: 21cm;
  margin: 0 auto;
}

.invoice-print-header {
  display: table;
  width: 100%;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid #3498db;
}

.company-section {
  display: table-cell;
  width: 60%;
  vertical-align: top;
}

.company-section h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.6rem;
}

.company-section p {
  margin: 0.25rem 0;
  color: #555;
  font-size: 0.9rem;
}

.invoice-info-section {
  display: table-cell;
  width: 40%;
  text-align: right;
  vertical-align: top;
}

.invoice-info-section h2 {
  margin: 0 0 0.5rem 0;
  color: #3498db;
  font-size: 1.4rem;
}

.invoice-info-section p {
  margin: 0.25rem 0;
  color: #555;
}

.customer-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.customer-section h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.customer-section p {
  margin: 0.5rem 0;
  color: #555;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.print-table thead {
  background: #34495e;
  color: white;
}

.print-table th,
.print-table td {
  padding: 0.75rem 0.5rem;
  text-align: left;
  border: 1px solid #ddd;
  font-size: 0.9rem;
}

.print-table th:nth-child(3),
.print-table td:nth-child(3) {
  text-align: center;
}

.print-table th:nth-child(4),
.print-table td:nth-child(4),
.print-table th:nth-child(5),
.print-table td:nth-child(5) {
  text-align: right;
}

.print-table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.print-totals {
  margin: 2rem 0;
  display: flex;
  justify-content: flex-end;
}

.totals-section {
  min-width: 350px;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.final-total {
  border-top: 2px solid #34495e;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-size: 1.3rem;
  color: #27ae60;
}

.payment-info {
  background: #e8f4f8;
  padding: 1rem;
  border-radius: 6px;
  margin: 1.5rem 0;
  border-left: 4px solid #3498db;
}

.payment-info p {
  margin: 0;
  color: #2c3e50;
  text-transform: capitalize;
}

.invoice-footer-print {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
}

.invoice-footer-print p {
  margin: 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.print-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #e0e0e0;
  background: #f8f9fa;
  position: sticky;
  bottom: 0;
}

.btn-print {
  flex: 1;
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-print:hover {
  background: #229954;
  transform: scale(1.02);
}

/* Estilos específicos para impresión */
@media print {
  body * {
    display: none !important; /* Oculta todo */
  }

  .printable-invoice {
    display: block !important;
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0.5cm !important;
  }

  /* Ocultar cualquier modal o contenedor extra */
  .print-modal, .print-content, .no-print {
    display: none !important;
  }

  /* Asegura que la tabla y secciones no se corten */
  .invoice-print-header,
  .customer-section,
  .print-table,
  .print-totals,
  .payment-info,
  .invoice-footer-print {
    page-break-inside: avoid !important;
  }

  @page {
    margin: 1.5cm 1cm;
    size: letter portrait;
  }
}

  /* Asegurar márgenes adecuados */
  @page {
    margin: 1.5cm 1cm;
    size: letter portrait;
  }


@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .products-sidebar {
    max-height: 400px;
  }
  
  .invoice-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .invoice-number {
    text-align: left;
  }
  
  .customer-info {
    grid-template-columns: 1fr;
  }
  
  .invoice-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .payment-method {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>