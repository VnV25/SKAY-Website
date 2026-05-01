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
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/25 p-4 rounded-2xl">
              <Heart size={36} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                My Wishlist
              </h1>
              <p className="text-white/55 mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="bg-white/10 border border-white/15 rounded-3xl p-10 text-center max-w-sm">
                <Heart size={52} className="mx-auto text-white/20 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h2>
                <p className="text-white/50 text-sm mb-6">
                  Start adding products you love to your wishlist!
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 font-semibold shadow-lg shadow-pink-500/25"
                >
                  <ShoppingBag size={18} />
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
      />
    </div>
  );
}
