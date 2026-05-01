/**
 * HeroSlider — full-viewport hero carousel built on embla-carousel-react
 * (already installed). Autoplay, loop, keyboard nav, dot indicators.
 */
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  tag: string;
  heading: string;
  sub: string;
  cta: string;
  href: string;
  accent: string; // tailwind gradient classes for the CTA button
}

const SLIDES: Slide[] = [
  {
    image: '/assets/polomain.jpeg',
    tag: 'New Collection',
    heading: 'Premium Custom\nT-Shirts & Apparel',
    sub: 'Oversized fits, bold prints, your brand — delivered fast.',
    cta: 'Shop Apparel',
    href: '/services',
    accent: 'from-pink-500 to-purple-500',
  },
  {
    image: '/assets/hoodiemain.png',
    tag: 'Best Seller',
    heading: 'Hoodies Built\nFor Your Brand',
    sub: 'Embroidery & screen-print on premium fleece. Min order: 1 piece.',
    cta: 'Explore Hoodies',
    href: '/services',
    accent: 'from-purple-500 to-indigo-500',
  },
  {
    image: '/assets/img540.jpg',
    tag: 'Corporate Gifting',
    heading: 'Branded Gifts\nThat Impress',
    sub: 'Mugs, bottles, notebooks — fully customised for your team.',
    cta: 'View Gift Sets',
    href: '/services',
    accent: 'from-indigo-500 to-cyan-500',
  },
  {
    image: '/assets/jerseymain.png',
    tag: 'Sports & Teams',
    heading: 'Custom Jerseys\nFor Every Team',
    sub: 'Player names, numbers, logos — ready in 5–7 days.',
    cta: 'Order Jerseys',
    href: '/quote',
    accent: 'from-cyan-500 to-pink-500',
  },
  {
    image: '/assets/img505.jpg',
    tag: 'Printing Services',
    heading: 'High-Quality\nPrinting Solutions',
    sub: 'Business cards, banners, stickers — all under one roof.',
    cta: 'Get a Quote',
    href: '/quote',
    accent: 'from-pink-500 to-orange-500',
  },
  {
    image: '/assets/collegemain.png',
    tag: 'School & College',
    heading: 'Merchandise',
    sub: 'Bulk orders for schools, colleges, and clubs. Competitive pricing.',
    cta: 'Enquire Now',
    href: '/contact',
    accent: 'from-orange-500 to-purple-500',
  },
];

export function HeroSlider() {
  const autoplay = Autoplay({ delay: 4500, stopOnInteraction: true });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [autoplay]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo   = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'min(92vh, 780px)' }}>
      {/* ── Embla viewport ── */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {SLIDES.map((slide, i) => (
            <div key={i} className="relative flex-[0_0_100%] h-full select-none">
              {/* Background image */}
              <img
                src={slide.image}
                alt={slide.heading}
                className="absolute inset-0 w-full h-full object-cover object-center"
                draggable={false}
              />

              {/* Multi-layer overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Subtle animated grain texture */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-2xl">
                    {/* Tag pill */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5 animate-fade-in">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${slide.accent}`} />
                      {slide.tag}
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5 whitespace-pre-line">
                      {slide.heading}
                    </h1>

                    {/* Sub */}
                    <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                      {slide.sub}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={slide.href}
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${slide.accent} text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:brightness-110 hover:scale-105 transition-all duration-300 shadow-lg`}
                      >
                        {slide.cta} <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/quote"
                        className="inline-flex items-center gap-2 border border-white/30 text-white/80 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                      >
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all duration-200 hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-6 right-6 z-20 text-white/50 text-xs font-mono tabular-nums">
        {String(selectedIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
