import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from 'figma:asset/7edebb097f2f6ca20f6c3623a0fbff43e7eeef09.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SKAY Printing Services" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-xl">SKAY Printing Services</div>
              <div className="text-xs text-gray-600">Since 2024</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              Home
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">
              Admin
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-orange-500 transition-colors">
              Services
            </Link>
            <Link to="/gallery" className="text-gray-700 hover:text-orange-500 transition-colors">
              Gallery
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition-colors">
              Contact
            </Link>
            <Link 
              to="/quote" 
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Get Quote
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
  );
}
