/**
 * AdminLogin.tsx
 *
 * Uses supabase.auth.signInWithPassword() directly so the browser gets a
 * real Supabase session. This makes auth.uid() non-null in RLS policies,
 * which fixes all "permission denied" errors on admin write operations.
 *
 * After Supabase login we verify the user has role = 'admin' in the
 * profiles table. If not, we sign them out immediately.
 *
 * Google login for customers is completely unchanged.
 */
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function AdminLogin() {
  const navigate = useNavigate();
  const { setAdminSession } = useAuth();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      // ── Step 1: Sign in with Supabase directly ──────────────────────────
      // This creates a real browser session so auth.uid() works in RLS.
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email:    credentials.username.trim().toLowerCase(),
        password: credentials.password,
      });

      if (authError || !authData.session || !authData.user) {
        throw new Error(authError?.message || 'Invalid credentials');
      }

      // ── Step 2: Verify admin role in profiles table ─────────────────────
      // We use the session that was just created — auth.uid() is now valid.
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        // Sign out so we don't leave a dangling session
        await supabase.auth.signOut();
        throw new Error('Admin profile not found. Contact support.');
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not have admin privileges.');
      }

      // ── Step 3: Store session for checkAdminAuth guard ──────────────────
      // We store the Supabase access_token as skay-admin-token so the
      // existing checkAdminAuth() helper can verify it client-side.
      const accessToken = authData.session.access_token;
      localStorage.setItem('skay-admin-token', accessToken);
      localStorage.setItem('isAdminLoggedIn', 'true');

      // ── Step 4: Update AuthContext ──────────────────────────────────────
      setAdminSession(
        {
          id:    profile.id,
          email: profile.email,
          name:  profile.full_name || profile.email,
          role:  profile.role,
        },
        accessToken,
      );

      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      // Auto-clear after 4 s so the form doesn't stay red forever
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-xl border border-white/20 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <Header mode="admin" />

      <section className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">

            {/* Icon + Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/25 mb-4">
                <Lock size={28} className="text-pink-400" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Admin Login
              </h1>
              <p className="text-white/50 text-sm mt-1">Access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" size={17} />
                  <input
                    type="email"
                    id="username"
                    value={credentials.username}
                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                    className={inputClass}
                    placeholder="Enter admin email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" size={17} />
                  <input
                    type="password"
                    id="password"
                    value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    className={inputClass}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-pink-500/25 mt-2"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>

            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
