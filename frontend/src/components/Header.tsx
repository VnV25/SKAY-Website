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
import logo from 'figma:asset/7edebb097f2f6ca20f6c3623a0fbff43e7eeef09.png';
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
      localStorage.removeItem('skay-cart');
      localStorage.removeItem('skay-wishlist');
      localStorage.removeItem('skay-recent');
      clearCustomerSession();
      await supabase.auth.signOut();
    }

    if (adminUser) {
      clearAdminSession();
    }

    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.href = isAdminMode ? '/admin' : '/';
  };

  return (
    <>
      {mode === 'public' && <AnnouncementBar />}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between ${isAdminMode ? 'items-center py-3' : 'items-center py-4'}`}>
            <Link to={isAdminMode ? '/admin/dashboard' : '/'} className="flex items-center gap-2">
              <img src={logo} alt="SKAY Printing" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-lg">SKAY Printing</div>
                {isAdminMode && <div className="text-xs text-gray-500">Admin panel</div>}
              </div>
            </Link>

            {!isAdminMode ? (
              <>
                <nav className="hidden md:flex items-center gap-4">
                  <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">Home</Link>
                  <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">Admin</Link>
                  <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors">About</Link>

                  <div className="relative group">
                    <Link to="/services" className="text-gray-700 hover:text-orange-500 transition-colors">Services</Link>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link to="/services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-t-md">
                        Browse Products
                      </Link>
                      <Link to="/services/detailed" className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-b-md">
                        All Services
                      </Link>
                    </div>
                  </div>

                  <Link to="/customized-merchandise" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Merchandise
                  </Link>
                  <Link to="/gallery" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Gallery
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Contact
                  </Link>

                  {settings.showWishlist && (
                    <Link to="/wishlist" className="relative text-gray-700 hover:text-orange-500 transition-colors">
                      <Heart size={24} />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}

                  {settings.showCart && (
                    <button
                      onClick={() => setCartOpen(true)}
                      className="relative text-gray-700 hover:text-orange-500 transition-colors"
                    >
                      <ShoppingCart size={24} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {displayUser ? (
                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(prev => !prev)}
                        className="flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm overflow-hidden">
                          {customerUser?.avatarUrl ? (
                            <img src={customerUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(displayName)
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-700 leading-4">{displayName}</div>
                          <div className="text-[11px] text-gray-500 leading-4">{isAdmin ? 'Admin' : 'Profile'}</div>
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>

                      {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                          {isAdmin ? (
                            <>
                              <Link
                                to="/admin/dashboard"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                                onClick={() => setProfileMenuOpen(false)}
                              >
                                <LayoutDashboard size={16} />
                                Admin dashboard
                              </Link>
                              <Link
                                to="/admin/settings"
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                                onClick={() => setProfileMenuOpen(false)}
                              >
                                <Settings size={16} />
                                Settings
                              </Link>
                            </>
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">Signed in as {displayName}</div>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="text-orange-500 border border-orange-500 px-6 py-2 rounded-md hover:bg-orange-50 transition-colors font-semibold"
                    >
                      Login
                    </Link>
                  )}

                  <Link
                    to="/quote"
                    className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Get Quote
                  </Link>
                </nav>

                <div className="flex items-center gap-4 md:hidden">
                  {settings.showWishlist && (
                    <Link to="/wishlist" className="relative text-gray-700">
                      <Heart size={20} />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  )}

                  {settings.showCart && (
                    <button onClick={() => setCartOpen(true)} className="relative text-gray-700">
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {displayUser && (
                    <button
                      onClick={() => setProfileMenuOpen(prev => !prev)}
                      className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm"
                    >
                      {getInitials(displayName)}
                    </button>
                  )}

                  <button
                    className="text-gray-700"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <Shield size={16} />
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-sm text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Website
                </Link>
                {displayUser ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white bg-orange-500 px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    <Shield size={16} />
                    Admin login
                  </Link>
                )}
              </div>
            )}
          </div>

          {!isAdminMode && mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-4">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link to="/customized-merchandise" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Merchandise
              </Link>
              <Link to="/gallery" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Gallery
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {displayUser ? (
                <>
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-md">
                    <User size={18} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} />
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-orange-500 border border-orange-500 px-6 py-2 rounded-md hover:bg-orange-50 transition-colors font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link
                to="/quote"
                className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors text-center"
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
