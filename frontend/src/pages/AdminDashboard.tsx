import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Users,
  Clock,
  TrendingUp,
  LogOut,
  Mail,
  Settings,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { api } from '../api/api';

type DashboardTab = 'dashboard' | 'profiles' | 'inquiries' | 'orders' | 'products';

const normalizeList = (payload: any, keys: string[]) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

export function AdminDashboard() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  const [profiles, setProfiles] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('skay-admin-token');
    if (!token) {
      navigate('/admin');
      return;
    }

    const init = async () => {
      await loadAll();
      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const loadAll = async () => {
    await Promise.allSettled([loadStats(), loadProfiles(), loadInquiries(), loadOrders(), loadProducts()]);
  };

  const loadStats = async () => {
    try {
      const data = await api.admin.dashboard();
      setStats(data || {});
    } catch (error) {
      console.error('Dashboard stats load failed:', error);
      setStats({});
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await api.admin.users();
      const normalized = normalizeList(data, ['users', 'data', 'profiles']);
      setProfiles(normalized);
    } catch (error) {
      console.error('Profiles load failed:', error);
      setProfiles([]);
    }
  };

  const loadInquiries = async () => {
    try {
      const data = await api.admin.contacts();
      const normalized = normalizeList(data, ['contacts', 'data', 'inquiries']);
      setInquiries(normalized);
    } catch (error) {
      console.error('Inquiries load failed:', error);
      setInquiries([]);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.admin.orders();
      const normalized = normalizeList(data, ['orders', 'data']);
      setOrders(normalized);
    } catch (error) {
      console.error('Orders load failed:', error);
      setOrders([]);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.products.list();
      console.log('Admin products API payload:', data);

      const normalized = normalizeList(data, ['data', 'products']);
      setProducts(normalized);
    } catch (error) {
      console.error('Products load failed:', error);
      setProducts([]);
    }
  };

  const updateProduct = async (id: string, updatedData: any) => {
    try {
      await api.products.update(id, updatedData);
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.products.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      setUploadingProductId(id);

      const imageUrl = URL.createObjectURL(file);
      await updateProduct(id, { image: imageUrl });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('skay-admin-token');
    navigate('/admin');
  };

  const statsDisplay = useMemo(
    () => [
      { icon: Users, label: 'Users', value: stats.totalUsers || profiles.length },
      { icon: UserCheck, label: 'Active Users', value: stats.customersWithLogins || stats.loggedInUsers || 0 },
      { icon: Package, label: 'Products', value: stats.totalProducts || products.length },
      { icon: TrendingUp, label: 'Orders', value: stats.totalOrders || orders.length },
      { icon: Mail, label: 'Inquiries', value: stats.totalContacts || inquiries.length },
      { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders || 0 },
    ],
    [stats, profiles.length, products.length, orders.length, inquiries.length]
  );

  if (isLoading) {
    return <div className="h-screen flex justify-center items-center">Loading dashboard...</div>;
  }

  const tableWrapper = 'bg-white shadow rounded-xl overflow-x-auto';
  const thStyle = 'text-left p-3 bg-gray-100 font-semibold text-sm';
  const tdStyle = 'p-3 border-t text-sm';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
          >
            <Settings size={16} /> Settings
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="px-6 flex gap-3 mb-6 flex-wrap">
        {(['dashboard', 'profiles', 'inquiries', 'orders', 'products'] as DashboardTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize ${
              activeTab === tab ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
          {statsDisplay.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white p-4 rounded-xl shadow">
                <Icon className="mb-2 text-gray-600" />
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="p-6">
          <div className={tableWrapper}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thStyle}>Name</th>
                  <th className={thStyle}>Email</th>
                  <th className={thStyle}>Role</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length > 0 ? (
                  profiles.map((p) => (
                    <tr key={p.id || p.email}>
                      <td className={tdStyle}>{p.full_name || p.name || '-'}</td>
                      <td className={tdStyle}>{p.email || '-'}</td>
                      <td className={tdStyle}>{p.role || 'customer'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tdStyle} colSpan={3}>
                      No profiles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="p-6">
          <div className={tableWrapper}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thStyle}>Name</th>
                  <th className={thStyle}>Email</th>
                  <th className={thStyle}>Message</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length > 0 ? (
                  inquiries.map((i) => (
                    <tr key={i.id || i.email}>
                      <td className={tdStyle}>{i.name || '-'}</td>
                      <td className={tdStyle}>{i.email || '-'}</td>
                      <td className={tdStyle}>{i.message || i.description || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tdStyle} colSpan={3}>
                      No inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="p-6">
          <div className={tableWrapper}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thStyle}>Order ID</th>
                  <th className={thStyle}>User</th>
                  <th className={thStyle}>Total</th>
                  <th className={thStyle}>Status</th>
                  <th className={thStyle}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className={tdStyle}>{order.id}</td>
                      <td className={tdStyle}>{order.user_id || order.userId || '-'}</td>
                      <td className={tdStyle}>{`INR ${order.total_amount ?? order.total ?? order.amount ?? 0}`}</td>
                      <td className={tdStyle}>{order.status || '-'}</td>
                      <td className={tdStyle}>
                        {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tdStyle} colSpan={5}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="p-6">
          <div className={tableWrapper}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thStyle}>Name</th>
                  <th className={thStyle}>Price</th>
                  <th className={thStyle}>Stock</th>
                  <th className={thStyle}>Trending</th>
                  <th className={thStyle}>Image</th>
                  <th className={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td className={tdStyle}>{p.name || '-'}</td>

                      <td className={tdStyle}>
                        <input
                          type="number"
                          defaultValue={p.price ?? 0}
                          onBlur={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                          className="border p-1 rounded w-24"
                        />
                      </td>

                      <td className={tdStyle}>
                        <input
                          type="number"
                          defaultValue={p.stock ?? 0}
                          onBlur={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                          className="border p-1 rounded w-20"
                        />
                      </td>

                      <td className={tdStyle}>
                        <input
                          type="checkbox"
                          checked={Boolean(p.trending)}
                          onChange={(e) => updateProduct(p.id, { trending: e.target.checked })}
                        />
                      </td>

                      <td className={tdStyle}>
                        {p.image && <img src={p.image} className="w-10 h-10 object-cover mb-1" alt={p.name || 'Product'} />}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(p.id, e.target.files[0]);
                            }
                          }}
                        />

                        {uploadingProductId === p.id && <div>Uploading...</div>}
                      </td>

                      <td className={tdStyle}>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-red-500 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={tdStyle} colSpan={6}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
