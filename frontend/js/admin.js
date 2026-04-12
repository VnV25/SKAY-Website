/* ============================================================
   admin.js – Admin dashboard: stats, products CRUD, settings
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Require admin session
  if (window.Auth) {
    await window.Auth.init();
    if (!window.Auth.isAdmin()) {
      window.location.href = 'login.html';
      return;
    }
  }

  const page = document.body.dataset.page;
  if (page === 'dashboard') await initDashboard();
  if (page === 'products')  await initAdminProducts();
  if (page === 'settings')  initSettings();

  // Customers link handler
  const customersLink = document.getElementById('customers-link');
  if (customersLink) {
    customersLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCustomersSection();
    });
  }

  // Logout button
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await window.Auth?.logout();
      window.location.href = 'login.html';
    });
  });
});

// ── Dashboard ─────────────────────────────────────────────
// Tab switching function
function showTab(tabName) {
  // Hide all content tabs
  document.getElementById('content-dashboard').style.display = 'none';
  document.getElementById('content-customers').style.display = 'none';
  
  // Reset all tab button styles
  const dashboardBtn = document.getElementById('tab-dashboard');
  const customersBtn = document.getElementById('tab-customers');
  
  dashboardBtn.style.color = 'var(--clr-gray-400)';
  dashboardBtn.style.borderBottom = '2px solid transparent';
  customersBtn.style.color = 'var(--clr-gray-400)';
  customersBtn.style.borderBottom = '2px solid transparent';
  
  // Show selected tab and update button styles
  if (tabName === 'dashboard') {
    document.getElementById('content-dashboard').style.display = 'block';
    dashboardBtn.style.color = 'var(--clr-orange-500)';
    dashboardBtn.style.borderBottom = '2px solid var(--clr-orange-500)';
  } else if (tabName === 'customers') {
    document.getElementById('content-customers').style.display = 'block';
    customersBtn.style.color = 'var(--clr-orange-500)';
    customersBtn.style.borderBottom = '2px solid var(--clr-orange-500)';
  }
}

async function initDashboard() {
  try {
    console.log('📊 Loading admin dashboard...');
    const stats = await window.API.admin.stats();
    
    setEl('stat-users',    stats.totalUsers    ?? 0);
    setEl('stat-products', stats.totalProducts ?? 0);
    setEl('stat-orders',   stats.totalOrders   ?? 0);
    setEl('stat-revenue',  `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`);

    console.log('📦 Loading orders...');
    const ordersResponse = await window.API.admin.orders();
    const orders = ordersResponse.orders || [];
    console.log('Orders loaded:', orders.length);
    renderRecentOrders(orders);
    
    // Update orders status
    const ordersStatus = document.getElementById('orders-status');
    if (ordersStatus) {
      ordersStatus.textContent = `${orders.length} orders`;
    }

    console.log('👥 Loading customers...');
    // Load customers
    await loadCustomers();
  } catch (err) {
    console.warn('Stats load failed (backend may be offline):', err.message);
    // Show fallback/offline data
    setEl('stat-users',    '—');
    setEl('stat-products', '—');
    setEl('stat-orders',   '—');
    setEl('stat-revenue',  '—');
  }
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  
  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No orders yet</td></tr>`;
    return;
  }
  
  tbody.innerHTML = orders.slice(0, 10).map(o => {
    const orderId = o.id || o.order_id || '???';
    const customerName = o.customer_name || o.user?.name || o.user || 'Unknown';
    const orderDate = o.order_date || o.created_at || new Date().toISOString();
    const amount = o.total || o.totalAmount || 0;
    const status = o.status || 'pending';
    const paymentStatus = o.payment_status || o.paymentStatus || 'pending';
    
    return `
    <tr>
      <td>#${String(orderId).slice(-6).toUpperCase()}</td>
      <td>${customerName}</td>
      <td>${new Date(orderDate).toLocaleDateString('en-IN')}</td>
      <td>₹${parseFloat(amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td><span class="badge badge--${statusColor(status)}">${status}</span></td>
      <td><span class="badge badge--${payColor(paymentStatus)}">${paymentStatus}</span></td>
    </tr>`
  }).join('');
}

async function loadCustomers() {
  try {
    const customersStatus = document.getElementById('customers-status');
    if (customersStatus) customersStatus.textContent = 'Loading...';
    
    const data = await window.API.admin.customers();
    
    // Update stats
    const totalCustomersEl = document.getElementById('stat-total-customers');
    const activeEl = document.getElementById('stat-active-today');
    
    if (totalCustomersEl) setEl('stat-total-customers', data.total ?? 0);
    if (activeEl) setEl('stat-active-today', data.activeToday ?? 0);
    
    // Render customers table
    renderCustomers(data.customers || []);
    
    if (customersStatus) customersStatus.textContent = `${data.total || 0} customers`;
    
    console.log(`✅ Loaded ${data.total || 0} customers`);
  } catch (err) {
    console.error('Customers load error:', err.message);
    const customersStatus = document.getElementById('customers-status');
    if (customersStatus) customersStatus.textContent = 'Failed to load';
    
    const tbody = document.getElementById('customers-tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-red-500)">Error: ${err.message}</td></tr>`;
    }
  }
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customers-tbody');
  if (!tbody) return;
  
  if (!customers || customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No customers registered yet</td></tr>`;
    return;
  }
  
  tbody.innerHTML = customers.map(c => {
    const lastLogin = c.lastLogin ? new Date(c.lastLogin).toLocaleDateString('en-IN') : 'Never';
    const joined = new Date(c.createdAt).toLocaleDateString('en-IN');
    const loginCount = c.loginCount || c.login_count || 0;
    const customerName = c.name || c.full_name || '—';
    const customerEmail = c.email || '—';
    const customerPhone = c.phone || '—';
    const statusBadge = c.status === 'active' ? '<span class="badge badge--green">Active</span>' : '<span class="badge badge--gray">Inactive</span>';
    
    return `
      <tr>
        <td>${customerName}</td>
        <td><a href="mailto:${customerEmail}" style="color:var(--clr-orange-500)">${customerEmail}</a></td>
        <td>${customerPhone}</td>
        <td style="text-align:center"><strong>${loginCount}</strong></td>
        <td>${lastLogin}</td>
        <td>${joined}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

async function updateCustomerStatus(id, status) {
  try {
    await window.API.contact.updateStatus(id, status);
    showToast('Status updated successfully', 'success');
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

function showCustomersSection() {
  document.querySelectorAll('.table-wrap').forEach(el => el.style.display = 'none');
  document.getElementById('customers-section').style.display = 'block';
  document.querySelectorAll('.admin-nav-link').forEach(link => link.classList.remove('active'));
  document.getElementById('customers-link').classList.add('active');
}

function statusColor(s) {
  return { pending:'orange', processing:'blue', shipped:'blue', delivered:'green', cancelled:'red' }[s] || 'gray';
}
function payColor(s) {
  return { paid:'green', pending:'orange', failed:'red', refunded:'blue' }[s] || 'gray';
}

// ── Admin Products ─────────────────────────────────────────
let adminProducts = [];

async function initAdminProducts() {
  await loadAdminProducts();
  initProductForm();

  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    openProductModal(null);
  });
  document.getElementById('product-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    const filtered = adminProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
    renderAdminProductsTable(filtered);
  });
}

async function loadAdminProducts() {
  try {
    const data = await window.API.products.list({ limit: 100 });
    adminProducts = data.products || data || [];
  } catch {
    adminProducts = window.ProductsModule?.getFallbackProducts() || [];
  }
  renderAdminProductsTable(adminProducts);
}

function renderAdminProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No products found</td></tr>`;
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img class="product-thumb" src="${p.image || p.images?.[0] || ''}"
           alt="${p.name}" onerror="this.src='https://via.placeholder.com/40?text=S'"></td>
      <td style="font-weight:600">${p.name}</td>
      <td><span class="badge badge--orange">${p.category}</span></td>
      <td>₹${Number(p.price).toLocaleString('en-IN')}</td>
      <td>${p.stock}</td>
      <td><span class="badge badge--${p.trending ? 'green' : 'gray'}">${p.trending ? 'Yes' : 'No'}</span></td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn--sm btn--outline" onclick="openProductModal('${p.id || p._id}')">✏ Edit</button>
          <button class="btn btn--sm btn--danger" onclick="deleteProduct('${p.id || p._id}')">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

function openProductModal(id) {
  const modal  = document.getElementById('product-modal');
  const form   = document.getElementById('product-form');
  const title  = document.getElementById('modal-form-title');
  if (!modal || !form) return;
  form.reset();
  modal.dataset.editId = id || '';

  if (id) {
    const p = adminProducts.find(x => (x.id || x._id) === id);
    if (p) {
      title.textContent = 'Edit Product';
      form.elements['name'].value        = p.name;
      form.elements['category'].value    = p.category;
      form.elements['price'].value       = p.price;
      form.elements['originalPrice'].value = p.originalPrice || '';
      form.elements['stock'].value       = p.stock;
      form.elements['description'].value = p.description || '';
      form.elements['image'].value       = p.image || (p.images?.[0] || '');
      form.elements['sizes'].value       = (p.sizes || []).join(', ');
      form.elements['trending'].checked  = !!p.trending;
    }
  } else {
    title.textContent = 'Add New Product';
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('product-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function initProductForm() {
  document.getElementById('product-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = this.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    const modal  = document.getElementById('product-modal');
    const editId = modal?.dataset.editId;
    const data = {
      name:          this.elements['name'].value.trim(),
      category:      this.elements['category'].value,
      price:         parseFloat(this.elements['price'].value),
      originalPrice: parseFloat(this.elements['originalPrice'].value) || undefined,
      stock:         parseInt(this.elements['stock'].value),
      description:   this.elements['description'].value.trim(),
      images:        [this.elements['image'].value.trim()],
      image:         this.elements['image'].value.trim(),
      sizes:         this.elements['sizes'].value.split(',').map(s => s.trim()).filter(Boolean),
      trending:      this.elements['trending'].checked,
    };

    try {
      if (editId) {
        await window.API.products.update(editId, data);
        window.Toast.show('Product updated!', 'success');
      } else {
        await window.API.products.create(data);
        window.Toast.show('Product created!', 'success');
      }
      closeProductModal();
      await loadAdminProducts();
    } catch (err) {
      window.Toast.show('Save failed: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Product';
    }
  });
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await window.API.products.delete(id);
    window.Toast.show('Product deleted', 'success');
    await loadAdminProducts();
  } catch (err) {
    window.Toast.show('Delete failed: ' + err.message, 'error');
  }
}

// ── Settings ──────────────────────────────────────────────
function initSettings() {
  const saved = localStorage.getItem('skay-admin-settings');
  const settings = saved ? JSON.parse(saved) : getDefaultSettings();

  const form = document.getElementById('settings-form');
  if (!form) return;

  // Populate fields
  form.elements['announcement-text'].value = settings.announcement?.text || '';
  form.elements['announcement-enabled'].checked = settings.announcement?.enabled ?? true;
  form.elements['show-trending'].checked   = settings.showTrending ?? true;
  form.elements['show-wishlist'].checked   = settings.showWishlist ?? true;
  form.elements['show-cart'].checked       = settings.showCart ?? true;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const updated = {
      announcement: {
        enabled: this.elements['announcement-enabled'].checked,
        text: this.elements['announcement-text'].value.trim(),
        backgroundColor: 'from-orange-600 to-red-600',
      },
      showTrending: this.elements['show-trending'].checked,
      showWishlist: this.elements['show-wishlist'].checked,
      showCart:     this.elements['show-cart'].checked,
    };
    localStorage.setItem('skay-admin-settings', JSON.stringify(updated));
    window.Toast.show('Settings saved!', 'success');
  });
}

function getDefaultSettings() {
  return {
    announcement: { enabled: true, text: 'Limited Time! Up to 40% OFF | Code: SKAY40' },
    showTrending: true, showWishlist: true, showCart: true,
  };
}
// ── Toast Notifications ────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}
// ── Helpers ───────────────────────────────────────────────
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

window.openProductModal  = openProductModal;
window.closeProductModal = closeProductModal;
window.deleteProduct     = deleteProduct;
