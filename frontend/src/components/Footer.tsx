import { Link } from 'react-router';
import { Instagram, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import logo from 'figma:asset/7edebb097f2f6ca20f6c3623a0fbff43e7eeef09.png';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="SKAY" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-base text-white">SKAY</div>
                <div className="text-xs text-pink-400">Since 2024</div>
              </div>
            </div>
            <p className="text-white/45 text-sm leading-relaxed">
              Premium Printing &amp; Custom Gifting Solutions
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Products' },
                { to: '/services/detailed', label: 'All Services' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/quote', label: 'Get Quote' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={scrollToTop}
                    className="text-white/45 hover:text-pink-400 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-pink-400 flex-shrink-0" />
                <a href="tel:+919322938003" className="text-white/45 hover:text-pink-400 transition-colors">
                  +91 93229 38003
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-pink-400 flex-shrink-0" />
                <a href="tel:+919527507300" className="text-white/45 hover:text-pink-400 transition-colors">
                  +91 95275 07300
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-pink-400 flex-shrink-0" />
                <a href="mailto:contact@skayprinting.com" className="text-white/45 hover:text-pink-400 transition-colors">
                  contact@skayprinting.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-pink-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/45">
                  Ekdant Corner, SKNCOE College,<br />Vadgaon Badruk, Pune 411041
                </span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/skay.officials/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-pink-500/25"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white" />
              </a>
              <a
                href="https://wa.me/919322938003"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500/80 border border-green-400/30 p-3 rounded-xl hover:bg-green-500 hover:scale-105 transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} className="text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-sm">
            © 2024 SKAY Printing Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
