/* ============================================================
   products.js – Render products, quick-view modal, filters
   ============================================================ */

// ── Star rendering ────────────────────────────────────────
function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    const full = i < Math.floor(rating);
    const half = !full && i < rating;
    const star = full ? '★' : half ? '⯨' : '☆';
    return `<span style="color:${full || half ? '#fbbf24' : '#d1d5db'}">${star}</span>`;
  }).join('');
}

// ── Format price ──────────────────────────────────────────
function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }

// ── Build a product card HTML ─────────────────────────────
function buildProductCard(p) {
  const discount = p.discount || (p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);
  const inWish = window.Wishlist?.has(p.id);
  return `
    <div class="product-card reveal" data-id="${p.id}">
      <div class="product-card__image">
        <img src="${p.image || p.images?.[0] || 'https://via.placeholder.com/400x300?text=SKAY'}"
             alt="${p.name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/400x300?text=SKAY'">
        <div class="product-card__badges">
          ${p.trending ? `<span class="badge badge--orange">🔥 Trending</span>` : ''}
          ${discount > 0 ? `<span class="badge badge--red">-${discount}%</span>` : ''}
          ${p.stock === 0 ? `<span class="badge badge--gray">Out of Stock</span>` : ''}
        </div>
        <div class="product-card__actions">
          <button class="wishlist-btn ${inWish ? 'wishlisted' : ''}"
                  onclick="toggleWishlist(event,'${p.id}')"
                  title="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}">
            ${inWish ? '❤️' : '🤍'}
          </button>
          <button onclick="openQuickView('${p.id}')" title="Quick view">👁</button>
        </div>
      </div>
      <div class="product-card__body">
        <div class="product-card__category">${p.category}</div>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__rating">
          <span class="stars">${renderStars(p.rating || 4.5)}</span>
          <span>(${p.reviews || 0})</span>
        </div>
        <div class="product-card__pricing">
          <span class="product-card__price">${fmt(p.price)}</span>
          ${p.originalPrice ? `<span class="product-card__original-price">${fmt(p.originalPrice)}</span>` : ''}
        </div>
        <button class="product-card__add-btn" onclick="addToCartFromCard('${p.id}')"
                ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
          🛒 Add to Cart
        </button>
      </div>
    </div>`;
}

// ── Render to container ───────────────────────────────────
function renderProducts(products, containerId = 'products-grid') {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products.length) {
    el.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--clr-gray-500);grid-column:1/-1">
      <div style="font-size:3rem">📦</div>
      <h3 style="margin-top:1rem">No products found</h3>
      <p>Try a different search or category filter.</p>
    </div>`;
    return;
  }
  el.innerHTML = products.map(buildProductCard).join('');
  observeReveal();
}

// ── Scroll-reveal ─────────────────────────────────────────
function observeReveal() {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
}

// ── Product store (cache from API) ────────────────────────
let _allProducts = [];

async function loadProducts(params = {}) {
  try {
    const data = await window.API.products.list(params);
    _allProducts = data.products || data || [];
    return _allProducts;
  } catch {
    // Fallback: use seeded static data
    return getFallbackProducts();
  }
}

function getProduct(id) {
  return _allProducts.find(p => p.id === id || p._id === id);
}

// ── Add to cart from card ─────────────────────────────────
function addToCartFromCard(id) {
  const p = getProduct(id);
  if (!p) return;
  if (p.sizes?.length > 0) {
    openQuickView(id);
    return;
  }
  window.Cart.add(p);
}

// ── Wishlist toggle ───────────────────────────────────────
function toggleWishlist(e, id) {
  e.stopPropagation();
  const p = getProduct(id);
  if (!p) return;
  window.Wishlist.toggle(p);
  // re-render button
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (card) {
    const btn = card.querySelector('.wishlist-btn');
    const inWish = window.Wishlist.has(id);
    if (btn) {
      btn.textContent = inWish ? '❤️' : '🤍';
      btn.classList.toggle('wishlisted', inWish);
    }
  }
}

// ── Quick View Modal ──────────────────────────────────────
function openQuickView(id) {
  const p = getProduct(id);
  if (!p) return;
  window.RecentlyViewed?.add(p);
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  modal.querySelector('#modal-img').src   = p.image || p.images?.[0] || '';
  modal.querySelector('#modal-name').textContent    = p.name;
  modal.querySelector('#modal-price').textContent   = fmt(p.price);
  modal.querySelector('#modal-original').textContent = p.originalPrice ? fmt(p.originalPrice) : '';
  modal.querySelector('#modal-desc').textContent    = p.description || '';
  modal.querySelector('#modal-stock').textContent   = p.stock > 0 ? `In stock (${p.stock})` : 'Out of stock';
  modal.querySelector('#modal-category').textContent = p.category;

  // Sizes
  const sizeWrap = modal.querySelector('#modal-sizes');
  if (sizeWrap) {
    sizeWrap.innerHTML = p.sizes?.length
      ? `<h4 style="font-size:.85rem;font-weight:600;margin-bottom:.5rem">Select Size</h4>
         <div class="size-btns">
           ${p.sizes.map(s => `<button class="size-btn" onclick="selectSize(this,'${s}')">${s}</button>`).join('')}
         </div>` : '';
  }

  // Colors
  const colorWrap = modal.querySelector('#modal-colors');
  if (colorWrap) {
    colorWrap.innerHTML = p.colors?.length
      ? `<h4 style="font-size:.85rem;font-weight:600;margin-bottom:.5rem">Select Color</h4>
         <div class="color-btns">
           ${p.colors.map(c => {
             const name = typeof c === 'string' ? c : c.name;
             const hex  = typeof c === 'string' ? '#888' : (c.hex || '#888');
             return `<button class="color-btn" style="background:${hex}" title="${name}"
                      onclick="selectColor(this,'${name}')"></button>`;
           }).join('')}
         </div>` : '';
  }

  // Reset qty
  const qtyInput = modal.querySelector('#modal-qty');
  if (qtyInput) qtyInput.value = 1;

  // Store product ref
  modal.dataset.productId = id;
  modal.dataset.selectedSize  = '';
  modal.dataset.selectedColor = '';

  // Add-to-cart button
  const addBtn = modal.querySelector('#modal-add-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const qty   = parseInt(modal.querySelector('#modal-qty')?.value) || 1;
      const size  = modal.dataset.selectedSize  || null;
      const color = modal.dataset.selectedColor || null;
      window.Cart.add(p, qty, size, color);
      closeModal('quick-view-modal');
    };
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function selectSize(btn, size) {
  btn.closest('.size-btns').querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('quick-view-modal').dataset.selectedSize = size;
}

function selectColor(btn, color) {
  btn.closest('.color-btns').querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('quick-view-modal').dataset.selectedColor = color;
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Qty controls ──────────────────────────────────────────
function changeQty(delta) {
  const inp = document.querySelector('#modal-qty');
  if (!inp) return;
  const val = Math.max(1, (parseInt(inp.value) || 1) + delta);
  inp.value = val;
}

// ── Category filter ───────────────────────────────────────
function initCategoryFilters(products, containerId = 'products-grid') {
  const filterWrap = document.querySelector('.category-filters');
  if (!filterWrap) return;
  const cats = ['all', ...new Set(products.map(p => p.category))];
  filterWrap.innerHTML = cats.map(c =>
    `<button class="filter-btn ${c === 'all' ? 'active' : ''}" onclick="filterByCategory('${c}',this,'${containerId}')">${c === 'all' ? 'All' : cap(c)}</button>`
  ).join('');
}

function filterByCategory(cat, btn, containerId) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'all' ? _allProducts : _allProducts.filter(p => p.category === cat);
  renderProducts(filtered, containerId);
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '); }

// ── Search ────────────────────────────────────────────────
function initSearch(containerId = 'products-grid') {
  const inp = document.querySelector('#product-search-input');
  if (!inp) return;
  inp.addEventListener('input', debounce(() => {
    const q = inp.value.toLowerCase();
    const filtered = _allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
    renderProducts(filtered, containerId);
  }, 300));
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Fallback static products (when API unavailable) ───────
function getFallbackProducts() {
  return [
    { id: 'p1', name: 'Classic White Oversized T-Shirt', category: 't-shirts', price: 699, originalPrice: 999, image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600', rating: 4.8, reviews: 124, stock: 50, sizes: ['S','M','L','XL','XXL'], colors: [{name:'White',hex:'#fff'},{name:'Black',hex:'#111'}], trending: true, discount: 30, description: 'Premium oversized t-shirt with custom print. 100% cotton, pre-shrunk fabric.' },
    { id: 'p2', name: 'Custom Printed Hoodie', category: 'hoodies', price: 1499, originalPrice: 1999, image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600', rating: 4.7, reviews: 89, stock: 30, sizes: ['S','M','L','XL'], colors: [{name:'Navy',hex:'#1e3a5f'},{name:'Gray',hex:'#6b7280'}], trending: true, discount: 25, description: 'Warm fleece hoodie with embroidered or printed logo.' },
    { id: 'p3', name: 'Magic Color-Changing Mug', category: 'mugs', price: 399, originalPrice: 549, image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600', rating: 4.9, reviews: 213, stock: 100, sizes: [], colors: [], trending: true, discount: 27, description: 'Black magic mug that reveals your design when filled with hot liquid.' },
    { id: 'p4', name: 'Embroidered Cap', category: 'caps', price: 549, originalPrice: 799, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', rating: 4.6, reviews: 67, stock: 75, sizes: ['Free Size'], colors: [{name:'Black',hex:'#111'},{name:'Navy',hex:'#1e3a5f'},{name:'Red',hex:'#dc2626'}], trending: false, discount: 31, description: 'Structured cap with premium embroidery work. Adjustable strap.' },
    { id: 'p5', name: 'Vinyl Sticker Pack (10pcs)', category: 'stickers', price: 199, originalPrice: 299, image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600', rating: 4.5, reviews: 156, stock: 200, sizes: [], colors: [], trending: false, discount: 33, description: 'Waterproof vinyl stickers. Custom shapes and designs available.' },
    { id: 'p6', name: 'Corporate Gift Set', category: 'custom', price: 1999, originalPrice: 2499, image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600', rating: 4.8, reviews: 45, stock: 20, sizes: [], colors: [], trending: false, discount: 20, description: 'Premium corporate gift set: mug + t-shirt + notepad in branded packaging.' },
    { id: 'p7', name: 'Polo T-Shirt with Embroidery', category: 't-shirts', price: 899, originalPrice: 1299, image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600', rating: 4.7, reviews: 98, stock: 60, sizes: ['S','M','L','XL','XXL'], colors: [{name:'Blue',hex:'#1e40af'},{name:'White',hex:'#fff'}], trending: false, discount: 31, description: 'Durable polo shirt with custom embroidery logo. Perfect for uniforms.' },
    { id: 'p8', name: 'Ceramic Coffee Mug', category: 'mugs', price: 299, originalPrice: 399, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', rating: 4.4, reviews: 72, stock: 150, sizes: [], colors: [], trending: false, discount: 25, description: 'High-quality ceramic mug with full-colour sublimation printing.' },
  ];
}

window.ProductsModule = { loadProducts, renderProducts, getProduct, initCategoryFilters, initSearch, buildProductCard, getFallbackProducts };
window.openQuickView  = openQuickView;
window.closeModal     = closeModal;
window.changeQty      = changeQty;
window.selectSize     = selectSize;
window.selectColor    = selectColor;
window.toggleWishlist = toggleWishlist;
window.addToCartFromCard = addToCartFromCard;
