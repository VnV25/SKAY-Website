import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useState, useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { ServiceProductCard } from '../components/ServiceProductCard';
import { ServiceModal } from '../components/ServiceModal';
import { useAdmin } from '../context/AdminContext';
import { bundles } from '../data/products';
import { Product } from '../context/ShopContext';
import { Gift, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceCategories, ServiceItem } from '../data/services';

export function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ service: ServiceItem, categoryName: string, categoryIcon: string } | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const { products } = useAdmin();

  const categories = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'apparel', label: 'Apparel & Textiles', count: products.filter(p => p.category === 'apparel').length },
    { id: 'gifts', label: 'Personalized Gifts', count: products.filter(p => p.category === 'gifts').length },
    { id: 'corporate', label: 'Corporate', count: products.filter(p => p.category === 'corporate').length },
    { id: 'printing', label: 'Printing', count: products.filter(p => p.category === 'printing').length },
  ];

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleServiceExplore = (categoryId: string) => {
    setSelectedServiceCategory(categoryId);
    setTimeout(() => {
      servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleServiceQuickView = (service: ServiceItem, categoryName: string, categoryIcon: string) => {
    setSelectedService({ service, categoryName, categoryIcon });
    setIsServiceModalOpen(true);
  };

  const filteredProducts = selectedCategory && selectedCategory !== 'all'
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const trendingProducts = products.filter(p => p.trending);

  const serviceShowcase = [
    { id: 'apparel', title: 'Apparel & Textiles', desc: 'Custom t-shirts, hoodies, jerseys & more', image: '/assets/img433.jpg' },
    { id: 'merchandise', title: 'Personalized Gifts', desc: 'Photo mugs, custom bottles, keychains & more', image: '/assets/img540.jpg' },
    { id: 'corporate', title: 'Corporate Solutions', desc: 'Branded merchandise for your business', image: '/assets/company.jpg' },
    { id: 'printing-embroidery', title: 'Printing Services', desc: 'Screen print, embroidery, digital & heat transfer', image: '/assets/img505.jpg' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-5">
              Our Products
            </h1>
            <p className="text-xl text-white/60 mb-7 leading-relaxed">
              Shop our comprehensive range of customizable products with guaranteed quality.
            </p>
            <Link
              to="/services/detailed"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 font-semibold shadow-lg shadow-pink-500/25"
            >
              View All Services & Capabilities
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Category Showcase */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
              Our Service Categories
            </h2>
            <p className="text-white/50">Explore our specialized services tailored for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceShowcase.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleServiceExplore(cat.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/15 h-80 hover:shadow-2xl hover:shadow-purple-500/15 hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="text-xl font-bold text-white mb-1.5">{cat.title}</h3>
                  <p className="text-white/70 text-xs mb-3">{cat.desc}</p>
                  <div className="flex items-center gap-1.5 text-pink-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight size={15} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-pink-500/15 to-purple-500/15 backdrop-blur-lg border border-white/15 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-7 text-white">
                <TrendingUp size={28} className="text-pink-400" />
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  Trending Products
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bundle Deals */}
      {bundles.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Gift size={28} className="text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Combo & Bundle Deals
                </h2>
                <p className="text-white/50 text-sm">Save more with our special bundle packages</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 relative"
                >
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full font-bold text-sm z-10 shadow-lg">
                    SAVE {bundle.discount}%
                  </div>
                  <img src={bundle.image} alt={bundle.name} className="w-full h-56 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">{bundle.name}</h3>
                    <div className="mb-4">
                      <div className="text-xs text-white/50 mb-2">Includes:</div>
                      <ul className="space-y-1">
                        {bundle.items.map((item, i) => (
                          <li key={i} className="text-sm text-white/65 flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                        ₹{bundle.price}
                      </span>
                      <span className="text-sm text-white/35 line-through">₹{bundle.originalPrice}</span>
                    </div>
                    {bundle.stock <= 5 && (
                      <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl mb-4 text-xs font-semibold">
                        🔥 Only {bundle.stock} bundles left!
                      </div>
                    )}
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25">
                      Get Bundle Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section className="py-5 bg-white/5 backdrop-blur-lg border-y border-white/10 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  (category.id === 'all' && !selectedCategory) || selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-white/10 border border-white/15 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-7">
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.label
              : 'All Products'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/40">
              No products found for this category yet. Add or update them from the admin dashboard.
            </div>
          )}
        </div>
      </section>

      {/* Services & Capabilities */}
      <section className="py-14" ref={servicesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
              Our Services & Capabilities
            </h2>
            <p className="text-white/50 mb-2">Comprehensive printing and customization solutions — all available for purchase!</p>
            <p className="text-xs text-white/35">
              Open any service to choose colors and variants, then preview the product image live before adding it to cart.
            </p>
            {selectedServiceCategory && (
              <button
                onClick={() => setSelectedServiceCategory(null)}
                className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
              >
                ✕ Show All Services
              </button>
            )}
          </div>

          {(selectedServiceCategory
            ? serviceCategories.filter(cat => cat.id === selectedServiceCategory)
            : serviceCategories
          ).map((category) => (
            <div key={category.id} className="mb-14">
              <div className="flex items-center gap-4 mb-7">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  <p className="text-white/50 text-sm">{category.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.items.map((service, index) => (
                  <ServiceProductCard
                    key={index}
                    service={service}
                    categoryName={category.name}
                    categoryIcon={category.icon}
                    onQuickView={(service) => handleServiceQuickView(service, category.name, category.icon)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-10">
            <Link
              to="/services/detailed"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 font-semibold shadow-lg shadow-pink-500/25"
            >
              View Complete Service Details
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose SKAY */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              Why Choose SKAY?
            </h2>
            <p className="text-white/50">Complete flexibility and quality assurance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: '🎨', title: 'Custom Designs', desc: 'Upload your design or we\'ll create one for you' },
              { emoji: '📏', title: 'Print Anywhere', desc: 'Front, back, sleeves — anywhere you want' },
              { emoji: '✨', title: 'Multiple Techniques', desc: 'Screen print, digital, embroidery, heat transfer' },
              { emoji: '📦', title: 'Min Order: 5 Pieces', desc: 'Perfect for small to large orders' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onSelectProduct={setSelectedProduct}
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
      />

      {selectedService && (
        <ServiceModal
          service={selectedService.service}
          categoryName={selectedService.categoryName}
          categoryIcon={selectedService.categoryIcon}
          isOpen={isServiceModalOpen}
          onClose={() => { setIsServiceModalOpen(false); setSelectedService(null); }}
        />
      )}

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/15 p-4 z-40">
        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-pink-500/25">
          🛒 View Cart ({products.length} items)
        </button>
      </div>
    </div>
  );
}
