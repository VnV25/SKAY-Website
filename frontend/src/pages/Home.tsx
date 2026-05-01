import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryCards } from '../components/CategoryCards';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { FeedbackForm } from '../components/FeedbackForm';
import { useAdmin } from '../context/AdminContext';
import { Product } from '../context/ShopContext';
import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  CheckCircle, Clock, Users, Headphones,
  ArrowRight, TrendingUp, Star, Zap, Package, Truck,
} from 'lucide-react';

// ─── Reusable reveal wrapper ──────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section heading helper ───────────────────────────────────────────────────
function SectionHeading({
  eyebrow,
  title,
  highlight,
  sub,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  sub?: string;
}) {
  return (
    <Reveal className="text-center mb-12">
      <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
        {title}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          {highlight}
        </span>
      </h2>
      {sub && <p className="text-white/50 max-w-xl mx-auto">{sub}</p>}
    </Reveal>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { recentlyViewed } = useShop();
  const { products } = useAdmin();

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const trendingProducts    = products.filter(p => p.trending).slice(0, 4);
  const recommendedProducts = products.slice(0, 4);

  // ── Data ──────────────────────────────────────────────────────────────────
  const stats = [
    { icon: CheckCircle, value: '500+', label: 'Projects Completed', color: 'text-pink-400' },
    { icon: Users,       value: '500+', label: 'Happy Clients',       color: 'text-purple-400' },
    { icon: Clock,       value: '2 Yrs+', label: 'Experience',        color: 'text-indigo-400' },
    { icon: Headphones,  value: '24/7', label: 'Support',             color: 'text-cyan-400' },
  ];

  const trustBadges = [
    { icon: Zap,     label: 'Fast Delivery',    sub: '5–7 business days' },
    { icon: Package, label: 'Min Order: 1 Pc',  sub: 'No bulk required' },
    { icon: Star,    label: 'Premium Quality',  sub: 'Guaranteed satisfaction' },
    { icon: Truck,   label: 'Pan India Shipping', sub: 'All major cities' },
  ];

  const featuredServices = [
    { title: 'Custom T-Shirts',          description: 'Oversized & normal fit with premium printing',  image: '/assets/img433.jpg' },
    { title: 'Magic Color Changing Mug', description: 'Heat-activated mug with personalized designs',  image: '/assets/magicmug.jpg' },
    { title: 'Hoodies & Embroidery',     description: 'High-quality embroidery works on apparel',      image: '/assets/hoodie.jpg' },
    { title: 'Corporate Gifting',        description: 'Professional gift sets for businesses',         image: '/assets/company.jpg' },
    { title: 'School Uniforms',          description: 'Bulk orders for educational institutions',      image: '/assets/uniform.jpg' },
    { title: 'Standard Printing',        description: 'Documents, brochures & marketing materials',   image: '/assets/printing.jpg' },
  ];

  const testimonials = [
    { name: 'Rajesh Kumar',  company: 'Tech Solutions Inc.',  rating: 5, text: 'SKAY delivered 200+ branded t-shirts for our corporate event. Quality was exceptional and delivery was on time!' },
    { name: 'Priya Sharma',  company: 'Green Valley School',  rating: 5, text: 'Best embroidery work on our school uniforms. Very professional team and timely delivery. Highly recommended!' },
    { name: 'Amit Patel',    company: 'Marketing Pro',        rating: 5, text: 'Their magic mugs are a hit with our clients. Great for corporate gifting — everyone loved them!' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── 1. HERO SLIDER ─────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── 2. TRUST BADGES ────────────────────────────────────────────────── */}
      <section className="py-8 border-y border-white/8 bg-white/3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <Reveal key={i} delay={i * 80} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-pink-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold leading-tight">{badge.label}</div>
                    <div className="text-white/45 text-xs">{badge.sub}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. STATS ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-center mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon size={28} className={stat.color} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORY CARDS ──────────────────────────────────────────────── */}
      <CategoryCards />

      {/* ── 5. FEATURED PRODUCTS (model-style) ─────────────────────────────── */}
      <FeaturedProducts products={products} onQuickView={handleQuickView} />

      {/* ── 6. TRENDING PRODUCTS ───────────────────────────────────────────── */}
      {trendingProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="flex items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-pink-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Trending Now
                  </h2>
                  <p className="text-white/45 text-xs">Most popular products this week</p>
                </div>
              </div>
              <Link
                to="/services"
                className="text-pink-400 hover:text-pink-300 text-sm font-semibold inline-flex items-center gap-1 transition-colors flex-shrink-0"
              >
                See All <ArrowRight size={14} />
              </Link>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product, i) => (
                <Reveal key={product.id} delay={i * 70}>
                  <ProductCard product={product} onQuickView={handleQuickView} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. SERVICES GRID ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Our"
            highlight="Services"
            sub="Wide range of printing and customization solutions for every need"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service, i) => (
              <Reveal key={i} delay={i * 70}>
                <Link
                  to="/services"
                  className="group block bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        View Details →
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-pink-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. RECOMMENDED PRODUCTS ────────────────────────────────────────── */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Handpicked For You"
              title="Recommended"
              highlight="Products"
              sub="Curated selection based on what our customers love most"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product, i) => (
                <Reveal key={product.id} delay={i * 70}>
                  <ProductCard product={product} onQuickView={handleQuickView} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. RECENTLY VIEWED ─────────────────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white">Recently Viewed</h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((product, i) => (
                <Reveal key={product.id} delay={i * 70}>
                  <ProductCard product={product} onQuickView={handleQuickView} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 10. TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Social Proof"
            title="What Our"
            highlight="Clients Say"
            sub="Trusted by 500+ happy clients across India"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm flex-1 mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.name}</div>
                      <div className="text-white/40 text-xs">{t.company}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/25 via-purple-500/20 to-indigo-500/25 backdrop-blur-lg border border-white/15 rounded-3xl p-12 md:p-16 text-center">
              {/* Decorative blobs */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Limited Time Offer
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                  Ready to Start Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Custom Project?
                  </span>
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                  Get a free quote today. We respond within 24 hours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/quote"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 font-bold shadow-lg shadow-pink-500/30"
                  >
                    Request Free Quote <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/services"
                    className="border border-white/25 text-white/80 px-10 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 12. FEEDBACK FORM ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Your Voice Matters"
            title="Leave a"
            highlight="Review"
            sub="Your feedback helps us serve you better"
          />
          <Reveal delay={100}>
            <FeedbackForm />
          </Reveal>
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
