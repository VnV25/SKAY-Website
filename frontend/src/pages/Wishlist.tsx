import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../context/ShopContext';
import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';

export function Wishlist() {
  const { wishlist } = useShop();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Heart size={48} className="text-red-500" />
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-2">My Wishlist</h1>
              <p className="text-xl text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Items */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">
                Start adding products you love to your wishlist!
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                <ShoppingBag size={20} />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
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
