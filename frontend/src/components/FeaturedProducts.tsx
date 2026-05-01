/**
 * FeaturedProducts — model/lifestyle-style product showcase.
 * Tall portrait cards with hover zoom, price overlay, and quick-view.
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Eye, Star, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Product } from '../context/ShopContext';

interface FeaturedProductsProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

/* Lifestyle / model images mapped by product id — falls back to product.image */
const LIFESTYLE_IMAGES: Record<string, string> = {
  'tshirt-oversized-1':  '/assets/oversize.jpg',
  'tshirt-normal-1':     '/assets/blacktshirt.jpg',
  'hoodie-1':            '/assets/zip-hoodie.jpg',
  'hoodie-pullover-1':   '/assets/gray-hoodie.jpg',
  'polo-1':              '/assets/navypolo.jpg',
  'jersey-1':            '/assets/jersey.jpg',
  'team-jersey-1':       '/assets/red-jersey.jpg',
  'cap-1':               '/assets/cap.jpg',
  'mug-coffee-1':        '/assets/mug.jpg',
  'mug-magic-1':         '/assets/magicmug.jpg',
  'notebook-1':          '/assets/notebook.jpg',
};

function ProductShowcaseCard({
  product,
  onQuickView,
  delay,
}: {
  product: Product;
  onQuickView: (p: Product) => void;
  delay: number;
}) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const [imgError, setImgError] = useState(false);

  const image = !imgError
    ? (LIFESTYLE_IMAGES[product.id] ?? product.image)
    : product.image;

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {/* Image container — tall portrait ratio */}
      <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-white/5">
        <img
          src={image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Discount badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Trending badge */}
        {product.trending && (
          <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            🔥 Hot
          </div>
        )}

        {/* Hover action buttons */}
        <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-gray-900 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            onClick={() => onQuickView(product)}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:brightness-110 transition-all shadow-lg flex-shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 group-hover:text-pink-300 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <Star size={11} className="fill-yellow-400 text-yellow-400" />
          <span className="text-white/60 text-xs">{product.rating}</span>
          <span className="text-white/30 text-xs">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold text-sm">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-white/35 text-xs line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts({ products, onQuickView }: FeaturedProductsProps) {
  const [headingRef, headingVisible] = useScrollReveal<HTMLDivElement>();

  // Pick 8 products — prefer trending, then fill from the rest
  const trending = products.filter(p => p.trending);
  const rest     = products.filter(p => !p.trending);
  const featured = [...trending, ...rest].slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div
          ref={headingRef}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
          style={{
            opacity:    headingVisible ? 1 : 0,
            transform:  headingVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div>
            <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-2">
              Featured Collection
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
              Wear Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Brand
              </span>
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-semibold text-sm transition-colors flex-shrink-0"
          >
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid — 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {featured.map((product, i) => (
            <ProductShowcaseCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              delay={i * 55}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
