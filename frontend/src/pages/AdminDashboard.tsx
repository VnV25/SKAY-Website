import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Package, Users, Clock, TrendingUp, LogOut, Mail,
  Settings, UserCheck, Trash2, RefreshCw, Tag,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';
import { api } from '../api/api';
import { uploadImageToSupabase } from '../lib/storage';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductVariantsPanel } from '../components/admin/ProductVariantsPanel';
import { fetchAllProducts, fetchAllVariants } from '../lib/adminSupabase';
import { checkAdminAuthAsync, classifyAdminError } from '../lib/checkAdminAuth';
import { useAuth } from '../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type DashboardTab = 'dashboard' | 'profiles' | 'inquiries' | 'orders' | 'products' | 'feedback';
type InquiryStatus = 'pending' | 'completed' | 'rejected';
const INQUIRY_STATUSES: InquiryStatus[] = ['pending', 'completed', 'rejected'];
const PRODUCTS_UPDATED_EVENT = 'skay:products-updated';
const PAGE_SIZE = 20; // products shown per page in the admin table

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeList(payload: any, keys: string[]): any[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function calcFinalPrice(price: number, discount: number): number {
  if (!discount || discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

/**
 * Controlled number input that stays in sync with the parent value.
 * Saves on blur or Enter key. Avoids the stale-defaultValue problem.
 */
function EditableNumber({
  value, min = 0, max, onSave, className,
}: {
  value: number;
  min?: number;
  max?: number;
  onSave: (v: number) => void;
  className?: string;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => { setLocal(String(value)); }, [value]);

  const commit = () => {
    const n = Number(local);
    if (!Number.isNaN(n)) {
      const clamped = max !== undefined
        ? Math.min(max, Math.max(min, n))
        : Math.max(min, n);
      onSave(clamped);
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      className={className}
    />
  );
}

// ── Status badge colours ──────────────────────────────────────────────────────
function statusBadge(status: string): string {
  const map: Record<string, string> = {
    pending:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    completed: 'bg-green-500/20  text-green-300  border-green-500/30',
    rejected:  'bg-red-500/20    text-red-300    border-red-500/30',
    paid:      'bg-green-500/20  text-green-300  border-green-500/30',
    cancelled: 'bg-red-500/20    text-red-300    border-red-500/30',
  };
  return map[status] ?? 'bg-white/10 text-white/50 border-white/15';
}

// ── Main component ────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate();
  const { clearAdminSession } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [isLoading,        setIsLoading]        = useState(true);
  const [activeTab,        setActiveTab]        = useState<DashboardTab>('dashboard');
  const [profiles,         setProfiles]         = useState<any[]>([]);
  const [inquiries,        setInquiries]        = useState<any[]>([]);
  const [orders,           setOrders]           = useState<any[]>([]);
  const [products,         setProducts]         = useState<any[]>([]);
  const [allVariants,      setAllVariants]      = useState<any[]>([]);
  const [feedback,         setFeedback]         = useState<any[]>([]);
  const [stats,            setStats]            = useState<any>({});
  const [uploadingId,      setUploadingId]      = useState<string | null>(null);
  const [updatingInquiryId,setUpdatingInquiryId]= useState<string | null>(null);
  const [expandedProductId,setExpandedProductId]= useState<string | null>(null);
  const [pageError,        setPageError]        = useState('');
  const [productPage,      setProductPage]      = useState(1);
  const [productSearch,    setProductSearch]    = useState('');

  // ── Derived: filtered + paginated products ─────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, productPage]);

  // Reset to page 1 when search changes
  useEffect(() => { setProductPage(1); }, [productSearch]);

  // ── Variant map: productId → variant[] ────────────────────────────────────
  const variantsByProduct = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const v of allVariants) {
      if (!map[v.product_id]) map[v.product_id] = [];
      map[v.product_id].push(v);
    }
    return map;
  }, [allVariants]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('skay-admin-token');
    if (!token) { navigate('/admin'); return; }

    const init = async () => { await loadAll(); setIsLoading(false); };
    void init();

    const handleRefresh = () => { void loadAll(); };
    window.addEventListener('focus', handleRefresh);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleRefresh);
    const interval = window.setInterval(handleRefresh, 30_000);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleRefresh);
      window.clearInterval(interval);
    };
  }, [navigate]);

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setPageError('');
    const results = await Promise.allSettled([
      loadStats(), loadProfiles(), loadInquiries(),
      loadOrders(), loadProducts(), loadFeedback(),
    ]);
    const rejected = results.find(r => r.status === 'rejected');
    if (rejected && rejected.status === 'rejected') {
      const msg = rejected.reason instanceof Error ? rejected.reason.message : 'Some data failed to load.';
      setPageError(msg);
    }
  }, []);

  const loadStats     = async () => { const d = await api.admin.dashboard(); setStats(d || {}); };
  const loadProfiles  = async () => { const d = await api.admin.users();     setProfiles(normalizeList(d, ['users', 'data', 'profiles'])); };
  const loadInquiries = async () => { const d = await api.admin.contacts();  setInquiries(normalizeList(d, ['contacts', 'data', 'inquiries'])); };
  const loadOrders    = async () => { const d = await api.admin.orders();    setOrders(normalizeList(d, ['orders', 'data'])); };
  const loadFeedback  = async () => { const d = await api.admin.feedback();  setFeedback(normalizeList(d, ['feedback', 'data'])); };

  /**
   * Load ALL products + ALL variants using direct Supabase queries.
   *
   * WHY direct queries:
   *   api.products.listAll()        → hits Express backend (works, JWT_SECRET auth)
   *   api.products.variants.listAll() → hits Vercel serverless (BROKEN — uses
   *     supabaseAdmin.auth.getUser() which rejects JWT_SECRET-signed admin tokens)
   *
   * Direct Supabase queries bypass the auth mismatch entirely and are faster
   * (one fewer network hop). RLS policies on the DB still apply.
   */
  const loadProducts = async () => {
    const [productsResult, variantsResult] = await Promise.allSettled([
      fetchAllProducts(),
      fetchAllVariants(),
    ]);

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value);
    } else {
      console.error('[AdminDashboard] loadProducts error:', productsResult.reason);
      // Non-fatal — show empty state rather than crashing
    }

    if (variantsResult.status === 'fulfilled') {
      setAllVariants(variantsResult.value);
    } else {
      // Variants are optional — don't block the dashboard if the table is missing
      console.warn('[AdminDashboard] loadVariants error:', variantsResult.reason);
      setAllVariants([]);
    }
  };

  const refreshProductsEverywhere = () => window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));

  // ── Product mutations ──────────────────────────────────────────────────────
  const updateProduct = async (id: string, updatedData: any) => {
    const authError = await checkAdminAuthAsync();
    if (authError) { setPageError(authError); return; }

    try {
      await api.products.update(id, updatedData);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
      refreshProductsEverywhere();
    } catch (err) {
      setPageError(classifyAdminError(err, 'Failed to update product'));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product and all its variants?')) return;

    const authError = await checkAdminAuthAsync();
    if (authError) { setPageError(authError); return; }

    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setAllVariants(prev => prev.filter(v => v.product_id !== id));
      if (expandedProductId === id) setExpandedProductId(null);
      await loadStats();
      refreshProductsEverywhere();
    } catch (err) {
      setPageError(classifyAdminError(err, 'Failed to delete product'));
    }
  };

  /**
   * Upload main product image.
   * Path: products/{product_id}/{timestamp}-{random}.{ext}
   */
  const handleMainImageUpload = async (productId: string, file: File) => {
    const authError = await checkAdminAuthAsync();
    if (authError) { setPageError(authError); return; }

    try {
      setPageError('');
      setUploadingId(productId);
      const folder = `products/${productId}`;
      const { publicUrl } = await uploadImageToSupabase(file, folder);
      await updateProduct(productId, { image: publicUrl });
    } catch (err) {
      setPageError(classifyAdminError(err, 'Image upload failed'));
    } finally {
      setUploadingId(null);
    }
  };

  // ── Inquiry status update ──────────────────────────────────────────────────
  const handleInquiryStatusChange = async (id: string, status: InquiryStatus) => {
    const authError = await checkAdminAuthAsync();
    if (authError) { setPageError(authError); return; }

    setUpdatingInquiryId(id);
    try {
      await api.admin.updateContact(id, { status });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch (err) {
      setPageError(classifyAdminError(err, 'Failed to update inquiry status'));
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const handleLogout = () => {
    // clearAdminSession removes localStorage keys AND calls supabase.auth.signOut()
    // so auth.uid() becomes null again — no dangling session left behind.
    clearAdminSession();
    navigate('/admin');
  };

  // ── Stats display ──────────────────────────────────────────────────────────
  const statsDisplay = useMemo(() => [
    { icon: Users,      label: 'Users',     value: stats.totalUsers    || profiles.length,  gradient: 'from-blue-500 to-indigo-500' },
    { icon: UserCheck,  label: 'Active',    value: stats.loggedInUsers || 0,                gradient: 'from-indigo-500 to-purple-500' },
    { icon: Package,    label: 'Products',  value: stats.totalProducts || products.length,  gradient: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, label: 'Orders',    value: stats.totalOrders   || orders.length,    gradient: 'from-pink-500 to-rose-500' },
    { icon: Mail,       label: 'Inquiries', value: stats.totalContacts || inquiries.length, gradient: 'from-orange-500 to-pink-500' },
    { icon: Clock,      label: 'Pending',   value: stats.pendingOrders || 0,                gradient: 'from-yellow-500 to-orange-500' },
  ], [stats, profiles.length, products.length, orders.length, inquiries.length]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="text-white/60 text-lg animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  // ── Shared table styles ────────────────────────────────────────────────────
  const thClass  = 'text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider border-b border-white/10';
  const tdClass  = 'px-4 py-3 text-sm text-white/75 border-b border-white/5 align-top';
  const inputCls = 'h-8 rounded-lg border border-white/20 bg-white/10 px-2 text-sm text-white outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent';
  const tabs: DashboardTab[] = ['dashboard', 'profiles', 'inquiries', 'orders', 'products', 'feedback'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <Header mode="admin" />

      {/* ── Top bar ── */}
      <div className="px-6 py-5 flex flex-wrap justify-between items-center gap-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Admin Dashboard
        </h1>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => void loadAll()}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-all duration-200"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-all duration-200"
          >
            <Settings size={15} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-red-500/25"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {pageError && (
        <div className="mx-6 mt-4 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-400 flex items-start justify-between gap-3">
          <span>{pageError}</span>
          <button onClick={() => setPageError('')} className="text-red-400/60 hover:text-red-400 flex-shrink-0 text-lg leading-none">×</button>
        </div>
      )}

      {/* ── Tab nav ── */}
      <div className="px-6 pt-5 pb-0 flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                : 'bg-white/10 border border-white/15 text-white/55 hover:bg-white/20 hover:text-white'
            }`}
          >
            {tab}
            {tab === 'products' && products.length > 0 && (
              <span className="ml-1.5 bg-white/15 text-white/70 text-[10px] px-1.5 py-0.5 rounded-full">
                {products.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">

        {/* ════════════════════════════════════════════════════════
            DASHBOARD STATS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsDisplay.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300">
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} mb-3 shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/45 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            PROFILES
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'profiles' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white/70">{profiles.length} users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Role</th>
                </tr></thead>
                <tbody>
                  {profiles.length > 0 ? profiles.map(p => (
                    <tr key={p.id || p.email} className="hover:bg-white/5 transition-colors">
                      <td className={tdClass}>{p.full_name || p.name || '—'}</td>
                      <td className={tdClass}>{p.email || '—'}</td>
                      <td className={tdClass}>
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {p.role || 'customer'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td className={tdClass} colSpan={3}>No profiles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            INQUIRIES — live status dropdown
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'inquiries' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/70">{inquiries.length} inquiries</h2>
              <p className="text-xs text-white/40">Change the dropdown to update status instantly</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Message</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Status</th>
                </tr></thead>
                <tbody>
                  {inquiries.length > 0 ? inquiries.map(item => (
                    <tr key={item.id || item.email} className="hover:bg-white/5 transition-colors">
                      <td className={tdClass}>{item.name || '—'}</td>
                      <td className={tdClass}>{item.email || '—'}</td>
                      <td className={tdClass}>
                        <div className="max-w-xs truncate text-white/60" title={item.message || item.description}>
                          {item.message || item.description || '—'}
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="text-white/40 text-xs">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className="relative inline-block">
                          <select
                            value={item.status || 'pending'}
                            disabled={updatingInquiryId === item.id}
                            onChange={e => void handleInquiryStatusChange(item.id, e.target.value as InquiryStatus)}
                            className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-wait ${statusBadge(item.status || 'pending')} [&>option]:bg-indigo-950 [&>option]:text-white`}
                          >
                            {INQUIRY_STATUSES.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          {updatingInquiryId === item.id && (
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td className={tdClass} colSpan={5}>No inquiries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            ORDERS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white/70">{orders.length} orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className={thClass}>Order ID</th>
                  <th className={thClass}>User</th>
                  <th className={thClass}>Total</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Created At</th>
                </tr></thead>
                <tbody>
                  {orders.length > 0 ? orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className={tdClass}><span className="font-mono text-xs text-white/50">{order.id}</span></td>
                      <td className={tdClass}>{order.user_id || order.userId || order.email || '—'}</td>
                      <td className={tdClass}>
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                          INR {order.total_amount ?? order.total ?? order.amount ?? 0}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(order.status)}`}>
                          {order.status || '—'}
                        </span>
                      </td>
                      <td className={tdClass}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  )) : (
                    <tr><td className={tdClass} colSpan={5}>No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            PRODUCTS — full list, search, pagination, variants
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden">

            {/* Header + search */}
            <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag size={15} className="text-pink-400" />
                <h2 className="text-sm font-semibold text-white/70">
                  {filteredProducts.length} / {products.length} products
                </h2>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name or category…"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="pl-8 pr-3 h-8 rounded-lg border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Image</th>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Price (₹)</th>
                    <th className={thClass}>Discount %</th>
                    <th className={thClass}>Final Price</th>
                    <th className={thClass}>Stock</th>
                    <th className={thClass}>Trending</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.length > 0 ? pagedProducts.map(p => {
                    const discount    = Number(p.discount || 0);
                    const price       = Number(p.price || 0);
                    const finalPrice  = calcFinalPrice(price, discount);
                    const hasDiscount = discount > 0;
                    const isExpanded  = expandedProductId === p.id;
                    const variantCount = (variantsByProduct[p.id] || []).length;

                    return (
                      <React.Fragment key={p.id}>
                        {/* ── Product row ── */}
                        <tr className="hover:bg-white/5 transition-colors">

                          {/* Image + upload */}
                          <td className={tdClass}>
                            <div className="flex flex-col gap-1.5 min-w-[80px]">
                              {p.image ? (
                                <ImageWithFallback
                                  src={p.image}
                                  alt={p.name || 'Product'}
                                  className="w-12 h-12 object-cover rounded-lg border border-white/15"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white/20 text-xs">
                                  No img
                                </div>
                              )}
                              <label className="cursor-pointer">
                                <div className="text-[10px] text-white/40 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors text-center">
                                  {uploadingId === p.id ? (
                                    <span className="text-pink-400 animate-pulse">Uploading…</span>
                                  ) : 'Upload'}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingId === p.id}
                                  onChange={e => {
                                    if (e.target.files?.[0]) void handleMainImageUpload(p.id, e.target.files[0]);
                                  }}
                                />
                              </label>
                            </div>
                          </td>

                          {/* Name */}
                          <td className={tdClass}>
                            <span className="font-medium text-white/90 text-xs leading-snug max-w-[140px] block">
                              {p.name || '—'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className={tdClass}>
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                              {p.category || '—'}
                            </span>
                          </td>

                          {/* Price — controlled input */}
                          <td className={tdClass}>
                            <EditableNumber
                              value={price}
                              min={0}
                              onSave={v => void updateProduct(p.id, { price: v })}
                              className={`${inputCls} w-24`}
                            />
                          </td>

                          {/* Discount % — controlled input */}
                          <td className={tdClass}>
                            <div className="flex items-center gap-1">
                              <EditableNumber
                                value={discount}
                                min={0}
                                max={100}
                                onSave={v => void updateProduct(p.id, { discount: v })}
                                className={`${inputCls} w-16`}
                              />
                              <span className="text-white/40 text-xs">%</span>
                            </div>
                          </td>

                          {/* Final price — computed, read-only */}
                          <td className={tdClass}>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-sm">
                                ₹{finalPrice}
                              </span>
                              {hasDiscount && (
                                <span className="text-white/35 text-xs line-through">₹{price}</span>
                              )}
                            </div>
                          </td>

                          {/* Stock — controlled input */}
                          <td className={tdClass}>
                            <EditableNumber
                              value={Number(p.stock ?? 0)}
                              min={0}
                              onSave={v => void updateProduct(p.id, { stock: v })}
                              className={`${inputCls} w-16`}
                            />
                          </td>

                          {/* Trending toggle */}
                          <td className={tdClass}>
                            <input
                              type="checkbox"
                              checked={Boolean(p.trending || p.featured)}
                              onChange={e => void updateProduct(p.id, { trending: e.target.checked })}
                              className="w-4 h-4 accent-pink-500 cursor-pointer"
                            />
                          </td>

                          {/* Actions */}
                          <td className={tdClass}>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs transition-colors"
                              >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                Variants
                                {variantCount > 0 && (
                                  <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full">
                                    {variantCount}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => void deleteProduct(p.id)}
                                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs transition-colors"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Variants panel row ── */}
                        {isExpanded && (
                          <tr key={`${p.id}-variants`}>
                            <td colSpan={9} className="px-4 pb-4 border-b border-white/5 bg-white/3">
                              <ProductVariantsPanel
                                productId={p.id}
                                productName={p.name || 'Product'}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }) : (
                    <tr>
                      <td className={tdClass} colSpan={9}>
                        {productSearch ? `No products match "${productSearch}".` : 'No products found. Products are synced from the database.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalProductPages > 1 && (
              <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs text-white/40">
                  Page {productPage} of {totalProductPages} ({filteredProducts.length} products)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProductPage(p => Math.max(1, p - 1))}
                    disabled={productPage <= 1}
                    className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {/* Page number pills */}
                  {Array.from({ length: Math.min(5, totalProductPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(productPage - 2, totalProductPages - 4));
                    const page  = start + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setProductPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          page === productPage
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                            : 'bg-white/10 border border-white/15 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}
                    disabled={productPage >= totalProductPages}
                    className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            FEEDBACK
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'feedback' && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white/70">{feedback.length} reviews</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Rating</th>
                  <th className={thClass}>Message</th>
                  <th className={thClass}>Date</th>
                </tr></thead>
                <tbody>
                  {feedback.length > 0 ? feedback.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className={tdClass}>{item.name || '—'}</td>
                      <td className={tdClass}>{item.email || '—'}</td>
                      <td className={tdClass}>
                        <span className="text-yellow-400 font-semibold">
                          {'★'.repeat(Math.min(5, Math.max(0, item.rating || 0)))}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <div className="max-w-xs truncate text-white/60" title={item.message}>
                          {item.message || '—'}
                        </div>
                      </td>
                      <td className={tdClass}>
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  )) : (
                    <tr><td className={tdClass} colSpan={5}>No feedback found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
