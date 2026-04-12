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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Our Services</h1>
            <p className="text-xl text-gray-600">
              Comprehensive printing and customization solutions for all your needs. From custom apparel to corporate merchandise, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {serviceCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-lg border-2 border-gray-100 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{category.icon}</span>
                    <div className="text-left">
                      <h2 className="text-2xl mb-1">{category.name}</h2>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="text-orange-500" size={28} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={28} />
                  )}
                </button>

                {/* Category Content */}
                {expandedCategory === category.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      {category.items.map((item, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg border border-orange-100"
                        >
                          <h3 className="text-xl mb-3 text-gray-900">{item.name}</h3>
                          <p className="text-gray-700 mb-4">{item.description}</p>
                          {item.features && (
                            <div className="space-y-2">
                              {item.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.minOrder && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
                              <span className="text-sm text-blue-700 font-semibold">
                                📦 {item.minOrder}
                              </span>
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

      {/* Client Categories */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4">Who We Serve</h2>
            <p className="text-xl opacity-90">
              Trusted by diverse organizations across India
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {clientCategories.map((client, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors"
              >
                <div className="text-5xl mb-3">{client.icon}</div>
                <h3 className="text-lg mb-2">{client.name}</h3>
                <p className="text-xs opacity-80">{client.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose SKAY?</h2>
            <p className="text-xl text-gray-600">
              We offer complete flexibility and quality assurance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl mb-3">Custom Designs Welcome</h3>
              <p className="text-gray-600">
                Upload your own design or let our creative team design for you
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">📏</div>
              <h3 className="text-xl mb-3">Print Anywhere</h3>
              <p className="text-gray-600">
                Flexible placement options - front, back, sleeves, or anywhere you want
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl mb-3">Minimum Order: 5 Pieces</h3>
              <p className="text-gray-600">
                Perfect for small to large orders - we accommodate everyone
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl mb-3">Multiple Techniques</h3>
              <p className="text-gray-600">
                Screen printing, digital printing, embroidery, heat transfer - we do it all
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">🌈</div>
              <h3 className="text-xl mb-3">Custom Colors & Patterns</h3>
              <p className="text-gray-600">
                Choose from unlimited colors and create unique patterns
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl mb-3">Fast Turnaround</h3>
              <p className="text-gray-600">
                Quick production and timely delivery for all orders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6">
            Ready to Start Your Custom Order?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get a free quote and bring your vision to life
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/quote"
              className="bg-white text-orange-500 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Request Quote
            </Link>
            <Link
              to="/services"
              className="border-2 border-white text-white px-8 py-3 rounded-md hover:bg-white/10 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
