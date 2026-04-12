import { Link } from 'react-router';
import { Menu, X, ShoppingCart, Heart, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from 'figma:asset/7edebb097f2f6ca20f6c3623a0fbff43e7eeef09.png';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { CartSidebar } from './CartSidebar';
import { AnnouncementBar } from './AnnouncementBar';
import { supabase } from '../lib/supabase';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const { cartCount, wishlist } = useShop();
  const { settings } = useAdmin();

  useEffect(() => {
    // Check for logged-in customer
    const user = localStorage.getItem('customerUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCustomerUser({
        ...parsedUser,
        name: parsedUser.name || parsedUser.full_name || parsedUser.email || 'Customer',
      });
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const newCustomerUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || 'Customer',
          };
          setCustomerUser(newCustomerUser);
          localStorage.setItem('customerUser', JSON.stringify(newCustomerUser));
        } else {
          setCustomerUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('skay-cart');
    localStorage.removeItem('skay-wishlist');
    localStorage.removeItem('skay-recent');
    await supabase.auth.signOut();
    setCustomerUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <AnnouncementBar />
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="SKAY Printing" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-lg">SKAY Printing</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">
                Home
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">
                Admin
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors">
                About
              </Link>
              
              {/* Services Dropdown */}
              <div className="relative group">
                <Link to="/services" className="text-gray-700 hover:text-orange-500 transition-colors">
                  Services
                </Link>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/services"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-t-md"
                  >
                    Browse Products
                  </Link>
                  <Link
                    to="/services/detailed"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-b-md"
                  >
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
              
              {/* Wishlist Icon */}
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
              
              {/* Cart Icon */}
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
              
              {/* Customer Info or Login Button */}
              {customerUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-md">
                    <User size={18} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">{customerUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-orange-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
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

            {/* Mobile Icons + Menu Button */}
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
              
              <button
                className="text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/customized-merchandise" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Merchandise
              </Link>
              <Link 
                to="/gallery" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {customerUser ? (
                <>
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-md">
                    <User size={18} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">{customerUser.name}</span>
                  </div>
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
      
      {settings.showCart && <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
    </>
  );
}