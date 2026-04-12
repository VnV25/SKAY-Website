import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../context/ShopContext';
import { useState } from 'react';
import merchandiseImage from 'figma:asset/e08009e5d3e387ac503a3afec1c11458a05a7081.png';

export function CustomizedMerchandise() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Customized Merchandise Products
  const merchandiseProducts: Product[] = [
    {
      id: 'umbrella-custom',
      name: 'Custom Branded Umbrella',
      category: 'gifts',
      price: 449,
      originalPrice: 699,
      image: 'https://images.unsplash.com/photo-1758165532015-5f986a2cffa7?w=600',
      rating: 4.7,
      reviews: 56,
      stock: 15,
      colors: ['Black', 'Navy', 'Red', 'Green'],
      trending: true,
      discount: 36,
      description: 'Premium quality umbrella with custom logo printing',
    },
    {
      id: 'hoodie-custom',
      name: 'Custom Logo Hoodie',
      category: 'apparel',
      price: 799,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
      rating: 4.9,
      reviews: 86,
      stock: 12,
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Grey', 'Navy', 'Maroon'],
      trending: true,
      discount: 38,
      description: 'Premium hoodie with your logo embroidered or printed',
    },
    {
      id: 'tshirt-custom',
      name: 'Custom Printed T-Shirt',
      category: 'apparel',
      price: 299,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600',
      rating: 4.8,
      reviews: 124,
      stock: 25,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy Blue', 'Grey'],
      trending: true,
      discount: 40,
      description: 'High-quality t-shirt with custom design printing',
    },
    {
      id: 'mug-custom',
      name: 'Custom Logo Mug',
      category: 'gifts',
      price: 149,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
      rating: 4.7,
      reviews: 156,
      stock: 30,
      colors: ['White', 'Black Inside', 'Red Inside'],
      trending: true,
      discount: 40,
      description: 'Ceramic mug with full-color logo printing',
    },
    {
      id: 'bottle-custom',
      name: 'Custom Branded Bottle',
      category: 'gifts',
      price: 349,
      originalPrice: 599,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
      rating: 4.6,
      reviews: 89,
      stock: 18,
      colors: ['Silver', 'Black', 'Blue'],
      discount: 42,
      description: 'Stainless steel bottle with custom logo engraving',
    },
    {
      id: 'bag-custom',
      name: 'Custom Tote Bag',
      category: 'gifts',
      price: 249,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1618249807726-2f381c277de1?w=600',
      rating: 4.6,
      reviews: 143,
      stock: 25,
      colors: ['Natural', 'Black', 'Navy'],
      discount: 38,
      description: 'Eco-friendly tote bag with custom printing',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 to-blue-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">CUSTOMIZED MERCHANDISE</h1>
            <p className="text-xl opacity-90">
              Premium quality promotional items with your logo
            </p>
          </div>
        </div>
      </section>

      {/* Merchandise Showcase Image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl mb-4">Our Product Range</h2>
            <p className="text-lg text-gray-600">
              Everything you need, customized with your brand
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <img
              src={merchandiseImage}
              alt="Customized Merchandise Products"
              className="w-full rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Customized Products</h2>
            <p className="text-xl text-gray-600">
              All products available with your custom logo and design
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchandiseProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose Our Customized Merchandise?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl mb-3">Custom Design</h3>
              <p>Upload your logo or let our designers create something unique for you</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl mb-3">Quick Turnaround</h3>
              <p>Fast production and delivery without compromising on quality</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">💯</div>
              <h3 className="text-xl mb-3">Premium Quality</h3>
              <p>Only the best materials and printing techniques for lasting impressions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6">
            Ready to Brand Your Merchandise?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today for bulk orders and special corporate packages
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/quote"
              className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
            >
              Get Custom Quote
            </a>
            <a
              href="/contact"
              className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-md hover:bg-orange-50 transition-colors"
            >
              Contact Sales Team
            </a>
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
    </div>
  );
}