/**
 * CategoryCards — visually rich category grid with hover zoom + overlay.
 * Uses useScrollReveal for staggered entrance animations.
 */
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Category {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  accent: string; // gradient for the hover overlay tint
}

const CATEGORIES: Category[] = [
  {
    id: 'custom-printing',
    title: 'Custom Printing',
    subtitle: 'Screen, digital & heat transfer',
    image: '/assets/printing.jpg',
    href: '/services',
    accent: 'from-pink-600/70 to-purple-700/70',
  },
  {
    id: 'apparel',
    title: 'T-Shirts & Apparel',
    subtitle: 'Oversized, polo, jerseys & more',
    image: '/assets/img433.jpg',
    href: '/services',
    accent: 'from-purple-600/70 to-indigo-700/70',
  },
  {
    id: 'hoodies',
    title: 'Hoodies & Jackets',
    subtitle: 'Zip-up, pullover, embroidery',
    image: '/assets/hoodie.jpg',
    href: '/services',
    accent: 'from-indigo-600/70 to-cyan-700/70',
  },
  {
    id: 'corporate-gifts',
    title: 'Corporate Gifts',
    subtitle: 'Branded kits for every occasion',
    image: '/assets/gifts.jpg',
    href: '/services',
    accent: 'from-cyan-600/70 to-pink-700/70',
  },
  {
    id: 'mugs-bottles',
    title: 'Mugs & Bottles',
    subtitle: 'Magic mugs, steel bottles & more',
    image: '/assets/magicmug.jpg',
    href: '/services',
    accent: 'from-orange-600/70 to-pink-700/70',
  },
  {
    id: 'school-college',
    title: 'School & College',
    subtitle: 'Uniforms, bags & merchandise',
    image: '/assets/uniform.jpg',
    href: '/services',
    accent: 'from-pink-600/70 to-orange-700/70',
  },
  {
    id: 'photo-frames',
    title: 'Photo & Artwork',
    subtitle: 'Pillows, clocks, custom frames',
    image: '/assets/artwork.jpg',
    href: '/services',
    accent: 'from-purple-600/70 to-pink-700/70',
  },
  {
    id: 'stationery',
    title: 'Stationery & Cards',
    subtitle: 'Business cards, notebooks, stickers',
    image: '/assets/card.jpg',
    href: '/services',
    accent: 'from-indigo-600/70 to-purple-700/70',
  },
];

function CategoryCard({ cat, delay }: { cat: Category; delay: number }) {
  const [ref, visible] = useScrollReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      to={cat.href}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5] block"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {/* Background image */}
      <img
        src={cat.image}
        alt={cat.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
      />

      {/* Base dark gradient — always visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Accent overlay — slides in on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-400`}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:translate-y-0 translate-y-1 transition-transform duration-300">
          {cat.title}
        </h3>
        <p className="text-white/65 text-xs mb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {cat.subtitle}
        </p>
        <div className="inline-flex items-center gap-1.5 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
          Explore <ArrowRight size={13} />
        </div>
      </div>

      {/* Corner badge */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
        <ArrowRight size={14} className="text-white" />
      </div>
    </Link>
  );
}

export function CategoryCards() {
  const [headingRef, headingVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div
          ref={headingRef}
          className="text-center mb-12"
          style={{
            opacity:    headingVisible ? 1 : 0,
            transform:  headingVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Browse by Category
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Everything You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Need
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            From custom apparel to corporate gifting — explore our full range of personalised products.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
