import { Link } from 'react-router';
import { Instagram, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import logo from 'figma:asset/7edebb097f2f6ca20f6c3623a0fbff43e7eeef09.png';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SKAY" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-lg">SKAY</div>
                <div className="text-sm text-orange-400">Since 2024</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Premium Printing & Custom Gifting Solutions
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" onClick={scrollToTop} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={scrollToTop} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services/detailed" onClick={scrollToTop} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/gallery" onClick={scrollToTop} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/quote" onClick={scrollToTop} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                  Get Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-orange-400" />
                <a href="tel:+919322938003" className="text-gray-400 hover:text-orange-400 transition-colors">+91 93229 38003</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-orange-400" />
                <a href="tel:+919527507300" className="text-gray-400 hover:text-orange-400 transition-colors">+91 95275 07300</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-orange-400" />
                <a href="mailto:contact@skayprinting.com" className="text-gray-400 hover:text-orange-400 transition-colors">contact@skayprinting.com</a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-orange-400 mt-1" />
                <span className="text-gray-400">Ekdant Corner, SKNCOE College,<br/>Vadgaon Badruk, Pune 411041</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/skay.officials/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://wa.me/919322938003"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 SKAY Printing Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}