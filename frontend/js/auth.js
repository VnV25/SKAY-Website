/* ============================================================
   auth.js – Session management for SKAY (admin + customer)
   ============================================================ */

// ── Supabase Config ──────────────────────────────────────────
// Fix: read 'supabase-anon-key' (was wrongly reading 'supabase-anon')
const SUPABASE_URL  = document.querySelector('meta[name="supabase-url"]')?.content  || '';
const SUPABASE_ANON = document.querySelector('meta[name="supabase-anon-key"]')?.content || '';

let supabase = null;

function initSupabase() {
  if (SUPABASE_URL && SUPABASE_ANON && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return true;
  }
  return false;
}

// ── Auth State ────────────────────────────────────────────────
const Auth = {
  _user: null,
  _onChangeCallbacks: [],

  async init() {
    // ── 1. Check for admin session (stored by admin/login.html) ──
    const adminToken = localStorage.getItem('skay-admin-token');
    const role       = localStorage.getItem('skay-role');

    if (adminToken && role === 'admin') {
      try {
        const adminData = localStorage.getItem('skay-admin');
        const admin     = adminData ? JSON.parse(adminData) : {};
        this._user      = { ...admin, role: 'admin', token: adminToken };
      } catch {
        this._user = { role: 'admin', token: adminToken };
      }
      return this._user;
    }

    // ── 2. Check for customer session ──
    const customerToken = localStorage.getItem('skay-token');
    const userData      = localStorage.getItem('skay-user');

    if (customerToken && userData) {
      try {
        const user = JSON.parse(userData);
        this._user = { ...user };
      } catch {
        this._user = null;
      }
      return this._user;
    }

    // ── 3. Try Supabase session as fallback ──
    const hasSupabase = initSupabase();
    if (hasSupabase && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this._user = { ...session.user };
        localStorage.setItem('skay-token', session.access_token);
      }
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          this._user = { ...session.user };
          localStorage.setItem('skay-token', session.access_token);
        } else {
          this._user = null;
          localStorage.removeItem('skay-token');
        }
        this._onChangeCallbacks.forEach(cb => cb(this._user));
      });
    }

    return this._user;
  },

  onChange(cb) { this._onChangeCallbacks.push(cb); },
  getUser()    { return this._user; },

  isAdmin() {
    // Check both runtime user and persisted role
    if (this._user?.role === 'admin') return true;
    return localStorage.getItem('skay-role') === 'admin' &&
           !!localStorage.getItem('skay-admin-token');
  },

  isLoggedIn() { return !!this._user; },

  /** Fully clear all session data (both admin and customer) */
  async logout() {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    this._user = null;
    [
      'skay-admin-token', 'skay-admin', 'skay-role',
      'skay-admin-session',
      'skay-token', 'skay-user',
    ].forEach(k => localStorage.removeItem(k));
    this._onChangeCallbacks.forEach(cb => cb(null));
  },

  /** Redirect to admin login if not authenticated as admin */
  requireAdmin() {
    const hasToken = !!localStorage.getItem('skay-admin-token');
    const isAdmin  = localStorage.getItem('skay-role') === 'admin';
    if (!hasToken || !isAdmin) {
      window.location.href = '../admin/login.html';
      return false;
    }
    return true;
  },
};

window.Auth = Auth;
