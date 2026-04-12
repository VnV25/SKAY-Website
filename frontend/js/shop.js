/* ============================================================
   shop.js – Cart, Wishlist, Recently Viewed (localStorage)
   ============================================================ */

const KEYS = {
  cart:    'skay-cart',
  wish:    'skay-wishlist',
  recent:  'skay-recent',
};

// ── Helpers ───────────────────────────────────────────────
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Cart ──────────────────────────────────────────────────
const Cart = {
  _items: [],
  _callbacks: [],

  init() {
    this._items = load(KEYS.cart);
    this._notify();
    return this;
  },

  _notify() {
    save(KEYS.cart, this._items);
    this._callbacks.forEach(cb => cb(this._items));
    this._updateBadge();
  },

  onChange(cb) { this._callbacks.push(cb); },

  _updateBadge() {
    const count = this.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  get() { return [...this._items]; },

  count() { return this._items.reduce((s, i) => s + i.quantity, 0); },

  total() { return this._items.reduce((s, i) => s + i.price * i.quantity, 0); },

  add(product, quantity = 1, size = null, color = null) {
    const idx = this._items.findIndex(i =>
      i.id === product.id && i.selectedSize === size && i.selectedColor === color
    );
    if (idx > -1) {
      this._items[idx].quantity += quantity;
    } else {
      this._items.push({ ...product, quantity, selectedSize: size, selectedColor: color });
    }
    this._notify();
    window.Toast?.show(`"${product.name}" added to cart!`, 'success');
  },

  remove(productId) {
    this._items = this._items.filter(i => i.id !== productId);
    this._notify();
  },

  updateQty(productId, qty) {
    if (qty <= 0) { this.remove(productId); return; }
    this._items = this._items.map(i => i.id === productId ? { ...i, quantity: qty } : i);
    this._notify();
  },

  clear() {
    this._items = [];
    this._notify();
  },
};

// ── Wishlist ──────────────────────────────────────────────
const Wishlist = {
  _items: [],
  _callbacks: [],

  init() {
    this._items = load(KEYS.wish);
    return this;
  },

  _notify() {
    save(KEYS.wish, this._items);
    this._callbacks.forEach(cb => cb(this._items));
  },

  onChange(cb) { this._callbacks.push(cb); },

  get() { return [...this._items]; },

  has(id) { return this._items.some(i => i.id === id); },

  toggle(product) {
    if (this.has(product.id)) {
      this.remove(product.id);
      window.Toast?.show('Removed from wishlist', 'info');
    } else {
      this.add(product);
      window.Toast?.show(`"${product.name}" saved to wishlist!`, 'success');
    }
  },

  add(product) {
    if (!this.has(product.id)) {
      this._items.push(product);
      this._notify();
    }
  },

  remove(id) {
    this._items = this._items.filter(i => i.id !== id);
    this._notify();
  },
};

// ── Recently Viewed ───────────────────────────────────────
const RecentlyViewed = {
  _items: [],

  init() {
    this._items = load(KEYS.recent);
    return this;
  },

  get() { return [...this._items]; },

  add(product) {
    this._items = [product, ...this._items.filter(i => i.id !== product.id)].slice(0, 8);
    save(KEYS.recent, this._items);
  },
};

// ── Toast ──────────────────────────────────────────────────
const Toast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },
};

// ── Initialise ────────────────────────────────────────────
Cart.init();
Wishlist.init();
RecentlyViewed.init();

window.Cart   = Cart;
window.Wishlist = Wishlist;
window.RecentlyViewed = RecentlyViewed;
window.Toast  = Toast;
