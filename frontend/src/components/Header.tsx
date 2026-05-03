import { Link } from 'react-router';
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  LogOut,
  User,
  ChevronDown,
  Shield,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { CartSidebar } from './CartSidebar';
import { AnnouncementBar } from './AnnouncementBar';
import { supabase } from '../lib/supabase';

type HeaderProps = {
  mode?: 'public' | 'admin';
};

function getInitials(name?: string) {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

export function Header({ mode = 'public' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { cartCount, wishlist } = useShop();
  const { settings } = useAdmin();
  const { customerUser, adminUser, clearCustomerSession, clearAdminSession } = useAuth();

  const isAdminMode = mode === 'admin';
  const displayUser = customerUser || adminUser;
  const displayName = customerUser?.name || adminUser?.name || adminUser?.username || adminUser?.email || 'Account';
  const isAdmin = Boolean(adminUser) && !customerUser;

  useEffect(() => {
    const closeMenus = () => {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
    };

    window.addEventListener('scroll', closeMenus, { passive: true });
    return () => window.removeEventListener('scroll', closeMenus);
  }, []);

  const handleLogout = async () => {
    if (customerUser) {
      sessionStorage.clear();
      localStorage.removeItem('skay-cart');
      localStorage.removeItem('skay-wishlist');
      localStorage.removeItem('skay-recent');
      clearCustomerSession();
      await supabase.auth.signOut();
    }

    if (adminUser) {
      // Clear admin session synchronously first, then sign out of Supabase
      localStorage.removeItem('adminUser');
      localStorage.removeItem('skay-admin-token');
      localStorage.removeItem('isAdminLoggedIn');
      clearAdminSession();
    }

    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    // Use replace to avoid back-button issues after logout
    window.location.replace(isAdminMode ? '/admin' : '/');
  };

  const navLinkClass =
    'text-white/70 hover:text-white transition-colors duration-200 text-sm font-medium';

  return (
    <>
      {mode === 'public' && <AnnouncementBar />}

      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/15 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between ${isAdminMode ? 'items-center py-3' : 'items-center py-4'}`}>

            {/* Logo */}
            <Link to={isAdminMode ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="flex items-center">
                <span
                  className="font-black tracking-[0.18em] text-2xl leading-none select-none"
                  style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
                >
                  <span style={{ color: '#ffffff' }}>S</span>
                  <span style={{ color: '#f97316' }}>K</span>
                  <span style={{ color: '#ffffff' }}>A</span>
                  <span style={{ color: '#ffffff' }}>Y</span>
                </span>
              </div>
              {isAdminMode && <div className="text-xs text-white/50 ml-1">Admin panel</div>}
            </Link>

            {/* Public Nav */}
            {!isAdminMode ? (
              <>
                <nav className="hidden md:flex items-center gap-5">
                  <Link to="/" className={navLinkClass}>Home</Link>
                  <Link to="/admin" className={navLinkClass}>Admin</Link>
                  <Link to="/about" className={navLinkClass}>About</Link>

                  {/* Services dropdown */}
                  <div className="relative group">
                    <Link to="/services" className={navLinkClass}>Services</Link>
                    <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link
                        to="/services"
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-t-xl transition-colors"
                      >
                        Browse Products
                      </Link>
                      <Link
                        to="/services/detailed"
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-b-xl transition-colors"
                      >
                        All Services
                      </Link>
                    </div>
                  </div>

                  <Link to="/gallery" className={navLinkClass}>Gallery</Link>
                  <Link to="/contact" className={navLinkClass}>Contact</Link>

                  {/* Wishlist */}
                  {settings.showWishlist && (
                    <Link to="/wishlist" className="relative text-white/70 hover:text-white transition-colors">
                      <Heart size={22} />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Cart */}
                  {settings.showCart && (
                    <button
                      onClick={() => setCartOpen(true)}
                      className="relative text-white/70 hover:text-white transition-colors"
                    >
                      <ShoppingCart size={22} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Profile */}
                  {displayUser ? (
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(prev => !prev)}
                        className="flex items-center gap-2.5 bg-white/10 border border-white/20 px-3 py-2 rounded-full hover:bg-white/20 transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shadow-md">
                          {customerUser?.avatarUrl ? (
                            <img src={customerUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(displayName)
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold text-white leading-4">{displayName}</div>
                          <div className="text-[10px] text-white/50 leading-4">{isAdmin ? 'Admin' : 'Profile'}</div>
                        </div>
                        <ChevronDown size={14} className="text-white/50" />
                      </button>

                      {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl py-2 z-50">
                          {isAdmin ? (
                            <>
                              <Link
                                to="/admin/dashboard"
                                className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                onClick={() => setProfileMenuOpen(false)}
                              >
                                <LayoutDashboard size={15} />
                                Admin dashboard
                              </Link>
                              <Link
                                to="/admin/settings"
                                className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                onClick={() => setProfileMenuOpen(false)}
                              >
                                <Settings size={15} />
                                Settings
                              </Link>
                            </>
                          ) : (
                            <div className="px-4 py-2 text-xs text-white/40">Signed in as {displayName}</div>
                          )}
                          <div className="my-1 border-t border-white/10" />
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <LogOut size={15} />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="text-white/80 border border-white/25 px-5 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm font-semibold"
                    >
                      Login
                    </Link>
                  )}

                  <Link
                    to="/quote"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 text-sm font-semibold shadow-lg shadow-pink-500/25"
                  >
                    Get Quote
                  </Link>
                </nav>

                {/* Mobile icons */}
                <div className="flex items-center gap-3 md:hidden">
                  {settings.showWishlist && (
                    <Link to="/wishlist" className="relative text-white/70">
                      <Heart size={20} />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}

                  {settings.showCart && (
                    <button onClick={() => setCartOpen(true)} className="relative text-white/70">
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {displayUser && (
                    <button
                      onClick={() => setProfileMenuOpen(prev => !prev)}
                      className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-md"
                    >
                      {getInitials(displayName)}
                    </button>
                  )}

                  <button
                    className="text-white/70 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </>
            ) : (
              /* Admin mode nav */
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Shield size={15} />
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Website
                </Link>
                {displayUser ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-pink-500/25"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-pink-500/25"
                  >
                    <Shield size={15} />
                    Admin login
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu */}
          {!isAdminMode && mobileMenuOpen && (
            <nav className="md:hidden pb-5 pt-2 flex flex-col gap-1 border-t border-white/10 mt-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/admin', label: 'Admin' },
                { to: '/about', label: 'About' },
                { to: '/services', label: 'Services' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {displayUser ? (
                <>
                  <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-2.5 rounded-xl mt-1">
                    <User size={16} className="text-pink-400" />
                    <span className="text-sm font-medium text-white/80">{displayName}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center gap-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-2 text-sm text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2.5 rounded-xl text-white/80 border border-white/20 hover:bg-white/10 transition-all duration-200 text-sm font-semibold text-center mt-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              <Link
                to="/quote"
                className="mt-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 rounded-xl hover:brightness-110 transition-all duration-200 text-sm font-semibold text-center shadow-lg shadow-pink-500/25"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Quote
              </Link>
            </nav>
          )}
        </div>
      </header>

      {mode === 'public' && settings.showCart && <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
    </>
  );
}
