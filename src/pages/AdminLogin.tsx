import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiPost, type AdminUser } from '../utils/api';

interface AdminLoginForm {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
  message?: string;
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<AdminLoginForm>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiPost<AdminLoginResponse>('/auth/admin/login', credentials);

      sessionStorage.setItem('adminToken', data.token);
      sessionStorage.setItem('adminUser', JSON.stringify(data.admin));
      localStorage.removeItem('isAdminLoggedIn');

      navigate('/admin/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 md:py-24 min-h-[60vh] flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <div className="text-center mb-8">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-orange-500" size={32} />
              </div>
              <h1 className="text-3xl mb-2">Admin Login</h1>
              <p className="text-gray-600">Access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    id="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
