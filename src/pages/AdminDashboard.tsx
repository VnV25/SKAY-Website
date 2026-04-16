import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Package, Users, Clock, TrendingUp, LogOut, FileText, Mail, Phone, Image as ImageIcon } from 'lucide-react';
import { ImageManager } from '../components/ImageManager';
import { isAdminAuthenticated, getAdminUser, logout, apiGet, apiPut } from '../utils/api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminUser] = useState(getAdminUser());

  useEffect(() => {
    // Check if user is authenticated
    if (!isAdminAuthenticated()) {
      navigate('/admin');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      
      // Load stats
      try {
        const statsData = await apiGet('/api/admin/stats');
        console.log('📊 Stats data:', statsData);
        setStats(statsData);
      } catch (err) {
        console.error('❌ Error loading stats:', err);
      }

      // Load orders
      try {
        const ordersData = await apiGet('/api/admin/orders?limit=50');
        console.log('📦 Orders data:', ordersData);
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error('❌ Error loading orders:', err);
      }

      // Load contacts
      try {
        const contactsData = await apiGet('/api/admin/contacts?limit=50');
        console.log('📧 Contacts data:', contactsData);
        setContacts(contactsData.contacts || []);
      } catch (err) {
        console.error('❌ Error loading contacts:', err);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string, type: 'order' | 'contact') => {
    const statuses = type === 'order' 
      ? ['pending', 'processing', 'completed', 'cancelled']
      : ['new', 'replied', 'contacted', 'closed'];
    
    const currentIndex = statuses.indexOf(currentStatus?.toLowerCase() || 'pending');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    console.log(`🔄 Updating ${type} ${id}: ${currentStatus} → ${nextStatus}`);

    setUpdatingId(id);
    try {
      const endpoint = type === 'order' ? `/api/admin/order/${id}` : `/api/admin/contact/${id}`;
      console.log(`📤 Calling: ${endpoint}`);
      
      const response = await apiPut(endpoint, { status: nextStatus });
      console.log(`✅ Success:`, response);
      
      if (type === 'order') {
        setOrders(orders.map(o => o.id === id ? { ...o, status: nextStatus } : o));
      } else {
        setContacts(contacts.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      }
    } catch (err: any) {
      console.error('❌ Error updating status:', err);
      alert(`Failed to update: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-500' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-500' },
      green: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' },
    };
    return colorMap[color] || colorMap.orange;
  };

  const statCards = [
    { icon: Package, label: 'Total Orders', value: stats.totalOrders?.toString() || '0', color: 'orange' },
    { icon: Users, label: 'Total Clients', value: stats.customersWithLogins?.toString() || '0', color: 'blue' },
    { icon: Clock, label: 'New Quotes', value: stats.newContacts?.toString() || '0', color: 'yellow' },
    { icon: TrendingUp, label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(0)}`, color: 'green' },
  ];

  const getStatusColor = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-700',
      'processing': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-red-100 text-red-700',
      'new': 'bg-orange-100 text-orange-700',
      'replied': 'bg-purple-100 text-purple-700',
      'contacted': 'bg-teal-100 text-teal-700',
      'closed': 'bg-gray-100 text-gray-700',
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Dashboard Header */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl mb-2">Admin Dashboard</h1>
              <p className="opacity-90">Welcome back {adminUser?.username}! Here's your business overview.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-500 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'quotes'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Quote Requests
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon size={18} />
              Media
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      {activeTab === 'overview' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const colors = getColorClasses(stat.color);
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={colors.icon} size={32} />
                    <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium`}>
                      Live
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-orange-500" size={24} />
              All Orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.user_id?.slice(0, 8) || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">₹{parseFloat(order.total || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleStatusUpdate(order.id, order.status, 'order')}
                            disabled={updatingId === order.id}
                            className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                          >
                            {updatingId === order.id ? 'Updating...' : 'Update Status'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Quote Requests Tab */}
      {activeTab === 'quotes' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-orange-500" size={24} />
              Quote Requests
            </h2>
            {contacts.length === 0 ? (
              <p className="text-gray-500">No quote requests yet</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{contact.name}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {contact.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {contact.phone || '—'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded mb-3 text-sm text-gray-700 max-h-20 overflow-y-auto">
                      {contact.message}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleStatusUpdate(contact.id, contact.status, 'contact')}
                        disabled={updatingId === contact.id}
                        className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                      >
                        {updatingId === contact.id ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Images/Media Management Tab */}
      {activeTab === 'images' && (
      <section className="py-8">
        <ImageManager />
      </section>
      )}

      <Footer />
    </div>
  );
}

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-500' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-500' },
      green: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' },
    };
    return colorMap[color] || colorMap.orange;
  };

  const statCards = [
    { icon: Package, label: 'Total Orders', value: stats.totalOrders?.toString() || '0', color: 'orange' },
    { icon: Users, label: 'Total Clients', value: stats.customersWithLogins?.toString() || '0', color: 'blue' },
    { icon: Clock, label: 'New Quotes', value: stats.newContacts?.toString() || '0', color: 'yellow' },
    { icon: TrendingUp, label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(0)}`, color: 'green' },
  ];

  const getStatusColor = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-700',
      'processing': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-red-100 text-red-700',
      'new': 'bg-orange-100 text-orange-700',
      'replied': 'bg-purple-100 text-purple-700',
      'contacted': 'bg-teal-100 text-teal-700',
      'closed': 'bg-gray-100 text-gray-700',
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Dashboard Header */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl mb-2">Admin Dashboard</h1>
              <p className="opacity-90">Welcome back! Here's your business overview.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-500 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'quotes'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Quote Requests
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon size={18} />
              Media
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      {activeTab === 'overview' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const colors = getColorClasses(stat.color);
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={colors.icon} size={32} />
                    <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-sm font-medium`}>
                      Live
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-orange-500" size={24} />
              All Orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{order.user_id?.slice(0, 8) || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">₹{parseFloat(order.total || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleStatusUpdate(order.id, order.status, 'order')}
                            disabled={updatingId === order.id}
                            className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                          >
                            {updatingId === order.id ? 'Updating...' : 'Update Status'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Quote Requests Tab */}
      {activeTab === 'quotes' && (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-orange-500" size={24} />
              Quote Requests
            </h2>
            {contacts.length === 0 ? (
              <p className="text-gray-500">No quote requests yet</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{contact.name}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {contact.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {contact.phone || '—'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded mb-3 text-sm text-gray-700 max-h-20 overflow-y-auto">
                      {contact.message}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleStatusUpdate(contact.id, contact.status, 'contact')}
                        disabled={updatingId === contact.id}
                        className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                      >
                        {updatingId === contact.id ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Images/Media Management Tab */}
      {activeTab === 'images' && (
      <section className="py-8">
        <ImageManager />
      </section>
      )}

      <Footer />
    </div>
  );
}
