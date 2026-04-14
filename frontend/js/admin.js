/* ============================================================
   admin.js – Admin dashboard logic
   Handles: stats, orders table, customers table, inquiries table
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Require admin session ─────────────────────────────────
  try {
    await window.Auth.init();
  } catch (e) {
    console.warn('Auth init error:', e.message);
  }

  if (!window.Auth.isAdmin()) {
    window.location.href = 'login.html';
    return;
  }

  // Show admin name in topbar
  const adminData = localStorage.getItem('skay-admin');
  if (adminData) {
    try {
      const admin = JSON.parse(adminData);
      const el = document.getElementById('admin-username');
      if (el) el.textContent = admin.full_name || admin.email || 'Admin';
    } catch { /* ignore */ }
  }

  // ── Page-specific initialisers ────────────────────────────
  const page = document.body.dataset.page;
  if (page === 'dashboard') await initDashboard();
  if (page === 'products')  await initAdminProducts();
  if (page === 'settings')  initSettings();

  // ── Logout ────────────────────────────────────────────────
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await window.Auth?.logout();
      window.location.href = 'login.html';
    });
  });
});

// ══════════════════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════════════════
function showTab(tabName) {
  const tabs = ['dashboard', 'customers', 'inquiries'];

  tabs.forEach(t => {
    const content = document.getElementById(`content-${t}`);
    const btn     = document.getElementById(`tab-${t}`);
    if (content) content.style.display = 'none';
    if (btn) {
      btn.style.color       = 'var(--clr-gray-400)';
      btn.style.borderBottom = '2px solid transparent';
      btn.classList.remove('active');
    }
  });

  const activeContent = document.getElementById(`content-${tabName}`);
  const activeBtn     = document.getElementById(`tab-${tabName}`);
  if (activeContent) activeContent.style.display = 'block';
  if (activeBtn) {
    activeBtn.style.color       = 'var(--clr-orange-500)';
    activeBtn.style.borderBottom = '2px solid var(--clr-orange-500)';
    activeBtn.classList.add('active');
  }

  // Update page title
  const titles = { dashboard: '📊 Dashboard', customers: '👥 Customers', inquiries: '📩 Inquiries' };
  const titleEl = document.getElementById('page-title');
  if (titleEl && titles[tabName]) titleEl.textContent = titles[tabName];
}

function setActiveNav(id) {
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ══════════════════════════════════════════════════════════
// DASHBOARD INIT
// ══════════════════════════════════════════════════════════
async function initDashboard() {
  // Load all sections in parallel
  await Promise.allSettled([
    loadStats(),
    loadOrders(),
    loadCustomers(),
    loadInquiries(),
  ]);
}

// ── Stats ─────────────────────────────────────────────────
async function loadStats() {
  try {
    const stats = await window.API.admin.stats();
    setEl('stat-users',    stats.totalUsers    ?? 0);
    setEl('stat-products', stats.totalProducts ?? 0);
    setEl('stat-orders',   stats.totalOrders   ?? 0);
    setEl('stat-contacts', stats.totalContacts ?? 0);
    setEl('stat-revenue',  `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`);

    // Badge for new inquiries
    const newCount = stats.newContacts || 0;
    const badge    = document.getElementById('new-inquiries-badge');
    if (badge && newCount > 0) {
      badge.textContent = newCount;
      badge.style.display = 'inline';
    }
  } catch (err) {
    console.warn('Stats load failed:', err.message);
    ['stat-users','stat-products','stat-orders','stat-contacts','stat-revenue']
      .forEach(id => setEl(id, '—'));
  }
}

// ══════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════
async function loadOrders() {
  const statusEl = document.getElementById('orders-status');
  if (statusEl) statusEl.textContent = 'Loading…';
  try {
    const res    = await window.API.admin.orders();
    const orders = res.orders || [];
    renderOrders(orders);
    if (statusEl) statusEl.textContent = `${orders.length} orders`;
  } catch (err) {
    console.error('Orders load error:', err.message);
    const tbody = document.getElementById('orders-tbody');
    if (tbody) tbody.innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-red-500)">Error: ${err.message}</td></tr>`;
    if (statusEl) statusEl.textContent = 'Error';
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No orders yet</td></tr>`;
    return;
  }
  tbody.innerHTML = orders.slice(0, 20).map(o => {
    const id            = o.id || '???';
    const customer      = o.customer_name || o.user || 'Unknown';
    const date          = o.order_date   || o.created_at || new Date().toISOString();
    const amount        = o.total        || 0;
    const status        = o.status       || 'pending';
    const payStatus     = o.payment_status || 'pending';
    return `
      <tr>
        <td>#${String(id).slice(-6).toUpperCase()}</td>
        <td>${escHtml(customer)}</td>
        <td>${new Date(date).toLocaleDateString('en-IN')}</td>
        <td>₹${parseFloat(amount).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
        <td><span class="badge badge--${orderStatusColor(status)}">${status}</span></td>
        <td><span class="badge badge--${payColor(payStatus)}">${payStatus}</span></td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${id}',this.value)">
            ${['pending','processing','shipped','delivered','cancelled'].map(s =>
              `<option value="${s}"${s===status?' selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`
            ).join('')}
          </select>
        </td>
      </tr>`;
  }).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await window.API.admin.updateOrderStatus(id, status);
    showToast('Order status updated!', 'success');
    await loadStats(); // Refresh counts
  } catch (err) {
    showToast('Failed to update order: ' + err.message, 'error');
  }
}

// ══════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════
async function loadCustomers() {
  const statusEl = document.getElementById('customers-status');
  if (statusEl) statusEl.textContent = 'Loading…';
  try {
    const data = await window.API.admin.customers();
    setEl('stat-total-customers', data.total    ?? 0);
    setEl('stat-active-today',    data.activeToday ?? 0);
    renderCustomers(data.customers || []);
    if (statusEl) statusEl.textContent = `${data.total || 0} customers`;
  } catch (err) {
    console.error('Customers error:', err.message);
    const tbody = document.getElementById('customers-tbody');
    if (tbody) tbody.innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:2rem;color:red">Error: ${err.message}</td></tr>`;
    if (statusEl) statusEl.textContent = 'Error';
  }
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customers-tbody');
  if (!tbody) return;
  if (!customers.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No customers registered yet</td></tr>`;
    return;
  }
  tbody.innerHTML = customers.map(c => {
    const lastLogin   = c.lastLogin   ? new Date(c.lastLogin).toLocaleDateString('en-IN')   : 'Never';
    const joined      = c.createdAt   ? new Date(c.createdAt).toLocaleDateString('en-IN')   : '—';
    const loginCount  = c.loginCount  || c.login_count || 0;
    const name        = escHtml(c.name  || c.full_name || '—');
    const email       = escHtml(c.email || '—');
    const phone       = escHtml(c.phone || '—');
    const statusBadge = c.status === 'active'
      ? '<span class="badge badge--green">Active</span>'
      : '<span class="badge badge--gray">Inactive</span>';
    return `
      <tr>
        <td>${name}</td>
        <td><a href="mailto:${email}" style="color:var(--clr-orange-500)">${email}</a></td>
        <td>${phone}</td>
        <td style="text-align:center"><strong>${loginCount}</strong></td>
        <td>${lastLogin}</td>
        <td>${joined}</td>
        <td>${statusBadge}</td>
      </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
// INQUIRIES  (contacts / quotes)
// ══════════════════════════════════════════════════════════
let _allInquiries = []; // cache for client-side filter

async function loadInquiries() {
  const statusEl = document.getElementById('inquiries-status');
  if (statusEl) statusEl.textContent = 'Loading…';
  try {
    const res = await window.API.admin.contacts();
    _allInquiries = res.contacts || [];

    // Compute mini-stats
    const newCount      = _allInquiries.filter(c => c.status === 'new').length;
    const pendingCount  = _allInquiries.filter(c => ['pending','in-progress'].includes(c.status)).length;
    const resolvedCount = _allInquiries.filter(c => ['completed','resolved'].includes(c.status)).length;

    setEl('stat-new-contacts',     newCount);
    setEl('stat-pending-contacts', pendingCount);
    setEl('stat-resolved-contacts',resolvedCount);

    // Badge on tab
    const badge = document.getElementById('new-inquiries-badge');
    if (badge) {
      if (newCount > 0) { badge.textContent = newCount; badge.style.display = 'inline'; }
      else badge.style.display = 'none';
    }

    renderInquiries(_allInquiries);
    if (statusEl) statusEl.textContent = `${_allInquiries.length} inquiries`;
  } catch (err) {
    console.error('Inquiries error:', err.message);
    const tbody = document.getElementById('inquiries-tbody');
    if (tbody) tbody.innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:2rem;color:red">Error: ${err.message}</td></tr>`;
    if (statusEl) statusEl.textContent = 'Error';
  }
}

function filterInquiries(statusValue) {
  const filtered = statusValue
    ? _allInquiries.filter(c => c.status === statusValue)
    : _allInquiries;
  renderInquiries(filtered);
}

function renderInquiries(contacts) {
  const tbody = document.getElementById('inquiries-tbody');
  if (!tbody) return;
  if (!contacts.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-gray-400)">No inquiries found</td></tr>`;
    return;
  }
  tbody.innerHTML = contacts.map((c, i) => {
    const date   = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—';
    const status = c.status || 'new';
    const msg    = escHtml((c.message || '').substring(0, 80)) + ((c.message || '').length > 80 ? '…' : '');
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escHtml(c.name || '—')}</strong></td>
        <td><a href="mailto:${escHtml(c.email || '')}" style="color:var(--clr-orange-500)">${escHtml(c.email || '—')}</a></td>
        <td style="max-width:220px;font-size:.8rem;color:var(--clr-gray-600)">${msg}</td>
        <td>${date}</td>
        <td><span class="badge badge--${inquiryStatusColor(status)}">${status}</span></td>
        <td>
          <select class="status-select" id="inquiry-select-${c.id}"
                  onchange="updateInquiryStatus('${c.id}', this.value)">
            <option value="new"         ${status==='new'         ?'selected':''}>🆕 New</option>
            <option value="pending"     ${status==='pending'     ?'selected':''}>⏳ Pending</option>
            <option value="in-progress" ${status==='in-progress' ?'selected':''}>🔄 In Progress</option>
            <option value="completed"   ${status==='completed'   ?'selected':''}>✅ Completed</option>
            <option value="resolved"    ${status==='resolved'    ?'selected':''}>✔ Resolved</option>
          </select>
        </td>
      </tr>`;
  }).join('');
}

async function updateInquiryStatus(id, status) {
  try {
    await window.API.admin.updateContactStatus(id, status);

    // Update cache so filter still works without a full reload
    const inquiry = _allInquiries.find(c => c.id === id || c.id === Number(id));
    if (inquiry) inquiry.status = status;

    // Update the badge chip in the same row
    const row    = document.getElementById(`inquiry-select-${id}`)?.closest('tr');
    const badge  = row?.querySelector('.badge');
    if (badge) {
      badge.className = `badge badge--${inquiryStatusColor(status)}`;
      badge.textContent = status;
    }

    // Refresh mini-stats & main stat card
    const newCount      = _allInquiries.filter(c => c.status === 'new').length;
    const pendingCount  = _allInquiries.filter(c => ['pending','in-progress'].includes(c.status)).length;
    const resolvedCount = _allInquiries.filter(c => ['completed','resolved'].includes(c.status)).length;
    setEl('stat-new-contacts',     newCount);
    setEl('stat-pending-contacts', pendingCount);
    setEl('stat-resolved-contacts', resolvedCount);

    const badge2 = document.getElementById('new-inquiries-badge');
    if (badge2) {
      if (newCount > 0) { badge2.textContent = newCount; badge2.style.display = 'inline'; }
      else badge2.style.display = 'none';
    }

    showToast(`Status updated to "${status}"`, 'success');
  } catch (err) {
    showToast('Failed to update: ' + err.message, 'error');
    // Revert the select visually
    const sel = document.getElementById(`inquiry-select-${id}`);
    if (sel) {
      const orig = _allInquiries.find(c => c.id === id || c.id === Number(id));
      if (orig) sel.value = orig.status;
    }
  }
}

// ══════════════════════════════════════════════════════════
// ADMIN PRODUCTS
// ══════════════════════════════════════════════════════════
let adminProducts = [];

async function initAdminProducts() {
  await loadAdminProducts();
  initProductForm();

  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    openProductModal(null);
  });
  document.getElementById('product-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    renderAdminProductsTable(
      adminProducts.filter(p =>
        p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
      )
    );
  });
}

async function loadAdminProducts() {
  try {
    const data  = await window.API.products.list({ limit: 100 });
    adminProducts = data.products || data || [];
  } catch {
    adminProducts = [];
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
               alt="${escHtml(p.name)}" onerror="this.src='https://via.placeholder.com/40?text=S'"></td>
      <td style="font-weight:600">${escHtml(p.name)}</td>
      <td><span class="badge badge--orange">${escHtml(p.category)}</span></td>
      <td>₹${Number(p.price).toLocaleString('en-IN')}</td>
      <td>${p.stock}</td>
      <td><span class="badge badge--${p.trending ? 'green' : 'gray'}">${p.trending ? 'Yes' : 'No'}</span></td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn--sm btn--outline" onclick="openProductModal('${p.id || p._id}')">✏ Edit</button>
          <button class="btn btn--sm btn--danger"  onclick="deleteProduct('${p.id || p._id}')">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

function openProductModal(id) {
  const modal = document.getElementById('product-modal');
  const form  = document.getElementById('product-form');
  const title = document.getElementById('modal-form-title');
  if (!modal || !form) return;
  form.reset();
  modal.dataset.editId = id || '';
  if (id) {
    const p = adminProducts.find(x => (x.id || x._id) === id);
    if (p) {
      title.textContent = 'Edit Product';
      form.elements['name'].value          = p.name;
      form.elements['category'].value      = p.category;
      form.elements['price'].value         = p.price;
      form.elements['originalPrice'].value = p.originalPrice || '';
      form.elements['stock'].value         = p.stock;
      form.elements['description'].value   = p.description || '';
      form.elements['image'].value         = p.image || (p.images?.[0] || '');
      form.elements['sizes'].value         = (p.sizes || []).join(', ');
      form.elements['trending'].checked    = !!p.trending;
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
    const submitBtn   = this.querySelector('[type="submit"]');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Saving…';
    const modal  = document.getElementById('product-modal');
    const editId = modal?.dataset.editId;
    const data   = {
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
        showToast('Product updated!', 'success');
      } else {
        await window.API.products.create(data);
        showToast('Product created!', 'success');
      }
      closeProductModal();
      await loadAdminProducts();
    } catch (err) {
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Save Product';
    }
  });
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await window.API.products.delete(id);
    showToast('Product deleted', 'success');
    await loadAdminProducts();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ══════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════
function initSettings() {
  const saved    = localStorage.getItem('skay-admin-settings');
  const settings = saved ? JSON.parse(saved) : getDefaultSettings();
  const form     = document.getElementById('settings-form');
  if (!form) return;
  form.elements['announcement-text'].value       = settings.announcement?.text || '';
  form.elements['announcement-enabled'].checked  = settings.announcement?.enabled ?? true;
  form.elements['show-trending'].checked         = settings.showTrending ?? true;
  form.elements['show-wishlist'].checked         = settings.showWishlist ?? true;
  form.elements['show-cart'].checked             = settings.showCart    ?? true;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const updated = {
      announcement: {
        enabled: this.elements['announcement-enabled'].checked,
        text:    this.elements['announcement-text'].value.trim(),
        backgroundColor: 'from-orange-600 to-red-600',
      },
      showTrending: this.elements['show-trending'].checked,
      showWishlist: this.elements['show-wishlist'].checked,
      showCart:     this.elements['show-cart'].checked,
    };
    localStorage.setItem('skay-admin-settings', JSON.stringify(updated));
    showToast('Settings saved!', 'success');
  });
}

function getDefaultSettings() {
  return {
    announcement: { enabled: true, text: 'Limited Time! Up to 40% OFF | Code: SKAY40' },
    showTrending: true, showWishlist: true, showCart: true,
  };
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function orderStatusColor(s) {
  return { pending:'orange', processing:'blue', shipped:'blue', delivered:'green', cancelled:'red' }[s] || 'gray';
}
function payColor(s) {
  return { paid:'green', pending:'orange', failed:'red', refunded:'blue' }[s] || 'gray';
}
function inquiryStatusColor(s) {
  return {
    new:'orange', pending:'blue', 'in-progress':'purple',
    completed:'green', resolved:'green',
  }[s] || 'gray';
}

// ── Toast ──────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span>${icon}</span>
    <span>${escHtml(message)}</span>
    <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:white;cursor:pointer;font-size:.875rem">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// ── Global exports ────────────────────────────────────────
window.showTab            = showTab;
window.setActiveNav       = setActiveNav;
window.openProductModal   = openProductModal;
window.closeProductModal  = closeProductModal;
window.deleteProduct      = deleteProduct;
window.updateInquiryStatus= updateInquiryStatus;
window.updateOrderStatus  = updateOrderStatus;
window.loadInquiries      = loadInquiries;
window.filterInquiries    = filterInquiries;
