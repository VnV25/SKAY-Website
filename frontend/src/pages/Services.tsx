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
import { Gift, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Our Products</h1>
            <p className="text-xl text-gray-600">
              Shop our comprehensive range of customizable products with guaranteed quality
            </p>
            <div className="mt-6">
              <Link
                to="/services/detailed"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                View All Services & Capabilities
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Category Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Service Categories</h2>
            <p className="text-lg text-gray-600">
              Explore our specialized services tailored for every need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Apparel & Textiles */}
            <button
              onClick={() => handleServiceExplore('apparel')}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white h-80"
            >
              <img
                src="/assets/img433.jpg"
                alt="Apparel & Textiles"
                className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Apparel & Textiles</h3>
                <p className="text-gray-100 text-sm mb-4">
                  Custom t-shirts, hoodies, jerseys & more
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore
                  <ArrowRight size={18} />
                </div>
              </div>
            </button>

            {/* Personalized Gifts */}
            <button
              onClick={() => handleServiceExplore('merchandise')}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white h-80"
            >
              <img
                src="/assets/img540.jpg"
                alt="Personalized Gifts"
                className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Personalized Gifts</h3>
                <p className="text-gray-100 text-sm mb-4">
                  Photo mugs, custom bottles, keychains & more
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore
                  <ArrowRight size={18} />
                </div>
              </div>
            </button>

            {/* Corporate */}
            <button
              onClick={() => handleServiceExplore('corporate')}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white h-80"
            >
              <img
                src="/assets/img571.jpg"
                alt="Corporate"
                className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Corporate Solutions</h3>
                <p className="text-gray-100 text-sm mb-4">
                  Branded merchandise for your business
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore
                  <ArrowRight size={18} />
                </div>
              </div>
            </button>

            {/* Printing Services */}
            <button
              onClick={() => handleServiceExplore('printing-embroidery')}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white h-80"
            >
              <img
                src="/assets/img505.jpg"
                alt="Printing Services"
                className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Printing Services</h3>
                <p className="text-gray-100 text-sm mb-4">
                  Screen print, embroidery, digital & heat transfer
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore
                  <ArrowRight size={18} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6 text-white">
              <TrendingUp size={32} />
              <h2 className="text-3xl">Trending Products</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bundle Deals */}
      {bundles.length > 0 && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Gift size={32} className="text-blue-600" />
              <div>
                <h2 className="text-3xl">Combo & Bundle Deals</h2>
                <p className="text-gray-600">Save more with our special bundle packages</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all relative"
                >
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg z-10">
                    SAVE {bundle.discount}%
                  </div>
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl mb-3">{bundle.name}</h3>
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Includes:</div>
                      <ul className="space-y-1">
                        {bundle.items.map((item, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(bundle.rating) ? '⭐' : '☆'}>
                            {i < Math.floor(bundle.rating) ? '⭐' : '☆'}
                          </span>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({bundle.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-orange-500">₹{bundle.price}</span>
                      <span className="text-lg text-gray-400 line-through">₹{bundle.originalPrice}</span>
                    </div>
                    {bundle.stock <= 5 && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md mb-4 text-sm">
                        🔥 Only {bundle.stock} bundles left!
                      </div>
                    )}
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all">
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
      <section className="py-8 bg-white sticky top-[120px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  (category.id === 'all' && !selectedCategory) || selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl mb-8">
            {selectedCategory ? 
              categories.find(c => c.id === selectedCategory)?.label : 
              'All Products'
            }
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services & Capabilities */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white" ref={servicesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Services & Capabilities</h2>
            <p className="text-xl text-gray-600">
              Comprehensive printing and customization solutions - All available for purchase!
            </p>
            {selectedServiceCategory && (
              <button
                onClick={() => setSelectedServiceCategory(null)}
                className="mt-4 inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm"
              >
                ✕ Show All Services
              </button>
            )}
          </div>

          {(selectedServiceCategory 
            ? serviceCategories.filter(cat => cat.id === selectedServiceCategory)
            : serviceCategories
          ).map((category) => (
            <div key={category.id} className="mb-16">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">{category.icon}</span>
                <div>
                  <h3 className="text-3xl mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>

              {/* Service Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          {/* View Full Services CTA */}
          <div className="text-center mt-12">
            <Link
              to="/services/detailed"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-md hover:from-orange-600 hover:to-orange-700 transition-colors text-lg"
            >
              View Complete Service Details
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose SKAY?</h2>
            <p className="text-xl text-gray-600">
              Complete flexibility and quality assurance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg border-2 border-orange-100 text-center">
              <div className="text-5xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Custom Designs</h3>
              <p className="text-sm text-gray-600">
                Upload your design or we'll create one for you
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg border-2 border-blue-100 text-center">
              <div className="text-5xl mb-3">📏</div>
              <h3 className="text-lg font-semibold mb-2">Print Anywhere</h3>
              <p className="text-sm text-gray-600">
                Front, back, sleeves - anywhere you want
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border-2 border-green-100 text-center">
              <div className="text-5xl mb-3">✨</div>
              <h3 className="text-lg font-semibold mb-2">Multiple Techniques</h3>
              <p className="text-sm text-gray-600">
                Screen print, digital, embroidery, heat transfer
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg border-2 border-purple-100 text-center">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Min Order: 5 Pieces</h3>
              <p className="text-sm text-gray-600">
                Perfect for small to large orders
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          service={selectedService.service}
          categoryName={selectedService.categoryName}
          categoryIcon={selectedService.categoryIcon}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="flex gap-3">
          <button className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold">
            🛒 View Cart ({products.length} items)
          </button>
        </div>
      </div>
    </div>
  );
}