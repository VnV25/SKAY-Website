import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Package, Users, Clock, TrendingUp, LogOut, FileText, Mail, Phone, Settings, BarChart3, UserCheck } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { adminUser, clearAdminSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'inquiries'>('dashboard');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalContacts: 0,
    pendingOrders: 0,
    customersWithLogins: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');

    if (!adminUser || !adminToken) {
      navigate('/admin');
      return;
    }

    setIsLoading(false);
    loadStats();
    loadProfiles();
    loadInquiries();
  }, [adminUser, navigate]);

  const loadStats = async () => {
    try {
      const data = await api.admin.stats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadProfiles = async () => {
    setDataLoading(true);
    try {
      const data = await api.admin.users();
      setProfiles(data.users || []);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadInquiries = async () => {
    setDataLoading(true);
    try {
      const data = await api.admin.contacts();
      setInquiries(data.contacts || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      await api.admin.updateContact(id, { status });
      // Reload inquiries to get updated data
      loadInquiries();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleLogout = async () => {
    clearAdminSession();
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const statsDisplay = [
    { icon: Users, label: 'Total Customers', value: (stats.totalUsers || 0).toString(), color: 'blue' },
    { icon: UserCheck, label: 'Customers Logged In', value: (stats.customersWithLogins || 0).toString(), color: 'green' },
    { icon: Package, label: 'Total Products', value: (stats.totalProducts || 0).toString(), color: 'orange' },
    { icon: TrendingUp, label: 'Total Orders', value: (stats.totalOrders || 0).toString(), color: 'purple' },
    { icon: Mail, label: 'Total Inquiries', value: (stats.totalContacts || 0).toString(), color: 'teal' },
    { icon: Clock, label: 'Pending Orders', value: (stats.pendingOrders || 0).toString(), color: 'amber' },
  ];

  const recentOrders = [
    {
      id: 'ORD-1234',
      client: 'Tech Solutions Inc.',
      product: 'T-Shirts',
      quantity: 200,
      status: 'In Production',
      date: '2024-02-08',
    },
    {
      id: 'ORD-1235',
      client: 'Green Valley School',
      product: 'School Uniforms',
      quantity: 150,
      status: 'Completed',
      date: '2024-02-07',
    },
    {
      id: 'ORD-1236',
      client: 'Marketing Pro',
      product: 'Coffee Mugs',
      quantity: 50,
      status: 'Pending',
      date: '2024-02-09',
    },
    {
      id: 'ORD-1237',
      client: 'StartUp Hub',
      product: 'Corporate Gift Kits',
      quantity: 30,
      status: 'In Production',
      date: '2024-02-10',
    },
  ];

  const recentQuotes = [
    {
      id: 'QT-5678',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 9876543210',
      service: 'Hoodies',
      status: 'Pending Review',
    },
    {
      id: 'QT-5679',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 9876543211',
      service: 'Magic Mugs',
      status: 'Quote Sent',
    },
    {
      id: 'QT-5680',
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '+91 9876543212',
      service: 'T-Shirts',
      status: 'Pending Review',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-100 text-green-700',
      'In Production': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Pending Review': 'bg-orange-100 text-orange-700',
      'Quote Sent': 'bg-purple-100 text-purple-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header mode="admin" />

      {/* Dashboard Header */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl mb-2">Admin Dashboard</h1>
              <p className="opacity-90">Welcome back! Here's your business overview.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/settings')}
                className="bg-white text-orange-500 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Settings size={20} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="bg-white text-orange-500 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('profiles');
                loadProfiles();
              }}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'profiles'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Registered Users
            </button>
            <button
              onClick={() => {
                setActiveTab('inquiries');
                loadInquiries();
              }}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'inquiries'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📧 Customer Inquiries
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      {activeTab === 'dashboard' && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`text-${stat.color}-500`} size={32} />
                      <div className={`bg-${stat.color}-100 px-3 py-1 rounded-full text-sm text-${stat.color}-700`}>
                        Active
                      </div>
                    </div>
                    <div className="text-3xl mb-1">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Profiles Management */}
      {activeTab === 'profiles' && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-orange-500" size={24} />
                    <h2 className="text-2xl">Registered Customers</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dataLoading ? 'Loading...' : `${profiles.length} registered users`}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading users...</td>
                      </tr>
                    ) : profiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No registered customers yet</td>
                      </tr>
                    ) : (
                      profiles.map((profile: any) => (
                        <tr key={profile.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{profile.full_name || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{profile.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {profile.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {profile.login_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(profile.created_at).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Management */}
      {activeTab === 'inquiries' && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="text-orange-500" size={24} />
                    <h2 className="text-2xl">Customer Inquiries</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dataLoading ? 'Loading...' : `${inquiries.length} inquiries`}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading inquiries...</td>
                      </tr>
                    ) : inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No inquiries yet</td>
                      </tr>
                    ) : (
                      inquiries.map((inquiry: any) => (
                        <tr key={inquiry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{inquiry.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-medium">{inquiry.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{inquiry.message}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inquiry.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(inquiry.status)}`}>
                              {inquiry.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={inquiry.status}
                              onChange={(e: any) => updateInquiryStatus(inquiry.id, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="new">New</option>
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}

      {/* Quick Actions */}
      {activeTab === 'dashboard' && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-lg">
              <h2 className="text-2xl mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Manage Products
                </button>
                <button className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
                  View All Quotes
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Settings size={20} />
                  Manage Settings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Preview Website
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
