import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useState } from 'react';
import { serviceCategories, clientCategories } from '../data/services';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router';

export function ServicesDetailed() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-5">
              Our Services
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Comprehensive printing and customization solutions for all your needs. From custom apparel to corporate merchandise, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Service Categories Accordion */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{category.icon}</span>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-white mb-0.5">{category.name}</h2>
                      <p className="text-white/50 text-sm">{category.description}</p>
                    </div>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="text-pink-400 flex-shrink-0" size={24} />
                  ) : (
                    <ChevronDown className="text-white/40 flex-shrink-0" size={24} />
                  )}
                </button>

                {expandedCategory === category.id && (
                  <div className="px-6 pb-6 border-t border-white/10">
                    <div className="grid md:grid-cols-2 gap-5 mt-5">
                      {category.items.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                          <p className="text-white/60 text-sm mb-4 leading-relaxed">{item.description}</p>
                          {item.features && (
                            <div className="space-y-1.5">
                              {item.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-white/60">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.minOrder && (
                            <div className="mt-4 bg-blue-500/15 border border-blue-500/25 px-3 py-2 rounded-lg">
                              <span className="text-xs text-blue-300 font-semibold">📦 {item.minOrder}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
              Who We Serve
            </h2>
            <p className="text-white/50 text-lg">Trusted by diverse organizations across India</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {clientCategories.map((client, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-5 text-center hover:bg-white/15 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-2">{client.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{client.name}</h3>
                <p className="text-xs text-white/45">{client.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SKAY */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              Why Choose SKAY?
            </h2>
            <p className="text-white/50">We offer complete flexibility and quality assurance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { emoji: '🎨', title: 'Custom Designs Welcome', desc: 'Upload your own design or let our creative team design for you' },
              { emoji: '📏', title: 'Print Anywhere', desc: 'Flexible placement options — front, back, sleeves, or anywhere you want' },
              { emoji: '🎯', title: 'Minimum Order: 5 Pieces', desc: 'Perfect for small to large orders — we accommodate everyone' },
              { emoji: '✨', title: 'Multiple Techniques', desc: 'Screen printing, digital printing, embroidery, heat transfer — we do it all' },
              { emoji: '🌈', title: 'Custom Colors & Patterns', desc: 'Choose from unlimited colors and create unique patterns' },
              { emoji: '⚡', title: 'Fast Turnaround', desc: 'Quick production and timely delivery for all orders' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-7 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-white/15 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Custom Order?
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Get a free quote and bring your vision to life
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/quote"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3.5 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 font-semibold shadow-lg shadow-pink-500/25"
              >
                Request Quote
              </Link>
              <Link
                to="/services"
                className="border border-white/25 text-white/80 px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
