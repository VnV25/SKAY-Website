/* ============================================================
   auth.js – Supabase Auth + Fallback localStorage Admin
   ============================================================ */

// ── Supabase Config (replace with your keys or set via meta tags) ──
const SUPABASE_URL  = document.querySelector('meta[name="supabase-url"]')?.content  || '';
const SUPABASE_ANON = document.querySelector('meta[name="supabase-anon"]')?.content || '';

let supabase = null;

// Initialize Supabase if keys are present
function initSupabase() {
  if (SUPABASE_URL && SUPABASE_ANON && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return true;
  }
  return false;
}

// ── Fallback admin (no Supabase) ──────────────────────────
const FALLBACK_ADMIN = { email: 'admin@skay.com', password: 'admin123', role: 'admin', name: 'SKAY Admin' };

// ── Auth State ────────────────────────────────────────────
const Auth = {
  _user: null,

  async init() {
    const hasSupabase = initSupabase();
    if (hasSupabase && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this._user = { ...session.user, role: 'admin' };
        localStorage.setItem('skay-token', session.access_token);
      }
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          this._user = { ...session.user, role: 'admin' };
          localStorage.setItem('skay-token', session.access_token);
        } else {
          this._user = null;
          localStorage.removeItem('skay-token');
        }
        this._onChangeCallbacks.forEach(cb => cb(this._user));
      });
    } else {
      // Fallback: check localStorage session
      const saved = localStorage.getItem('skay-admin-session');
      if (saved) {
        try { this._user = JSON.parse(saved); } catch { this._user = null; }
      }
    }
    return this._user;
  },

  _onChangeCallbacks: [],
  onChange(cb) { this._onChangeCallbacks.push(cb); },

  getUser() { return this._user; },
  isAdmin() { return this._user?.role === 'admin'; },
  isLoggedIn() { return !!this._user; },

  async loginWithEmail(email, password) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      this._user = { ...data.user, role: 'admin' };
      localStorage.setItem('skay-token', data.session.access_token);
      this._onChangeCallbacks.forEach(cb => cb(this._user));
      return this._user;
    }
    // Fallback
    if (email === FALLBACK_ADMIN.email && password === FALLBACK_ADMIN.password) {
      const user = { id: 'admin-1', email, name: FALLBACK_ADMIN.name, role: 'admin' };
      this._user = user;
      localStorage.setItem('skay-admin-session', JSON.stringify(user));
      localStorage.setItem('skay-token', 'fallback-admin-token');
      this._onChangeCallbacks.forEach(cb => cb(this._user));
      return user;
    }
    throw new Error('Invalid credentials. Use admin@skay.com / admin123');
  },

  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    this._user = null;
    localStorage.removeItem('skay-admin-session');
    localStorage.removeItem('skay-token');
    this._onChangeCallbacks.forEach(cb => cb(null));
  },

  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = '../admin/login.html';
      return false;
    }
    return true;
  },
};

window.Auth = Auth;
