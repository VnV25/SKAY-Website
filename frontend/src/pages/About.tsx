import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Award, Target, Zap, Heart } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Award,
      title: 'Quality',
      description: 'We never compromise on the quality of materials and printing techniques.',
    },
    {
      icon: Zap,
      title: 'Speed',
      description: 'Fast turnaround times without sacrificing quality or attention to detail.',
    },
    {
      icon: Target,
      title: 'Customization',
      description: 'Every project is unique. We tailor solutions to your specific needs.',
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: '24/7 support and dedicated service for every client, big or small.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">About SKAY Printing Services</h1>
            <p className="text-xl text-gray-600">
              Your trusted partner for premium printing and custom merchandise since 2024.
            </p>
          </div>
        </div>
      </section>

      {/* About SKAY Text Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl mb-4">ABOUT SKAY</h2>
                <p className="text-2xl text-orange-300 mb-6">Where vision meets reality!</p>
              </div>
              
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  SKAY is a creative, startup merchandise customisation firm founded by a group of enthusiastic designers and heroes from around the globe. Starting as a mere concept, our unwavering dedication has now grown into a trusted name in the customised gifting and merchandise market of India.
                </p>
                
                <p>
                  We design and deliver premium quality custom printed t-shirts, hoodies, mugs, bottles, clocks, and gifts for corporates, schools, colleges, banks, and all types of organisations.
                </p>
                
                <p>
                  We believe that every idea deserves to be seen and felt. Committed to excellence, we turn your vision into high-quality reality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">WHY CHOOSE US?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Timely Delivery</h3>
              <p className="text-gray-700">We value your time and ensure punctual deliveries.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• High-Quality Products</h3>
              <p className="text-gray-700">Premium materials and durable, elite-grade items.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Customer-Centric Support</h3>
              <p className="text-gray-700">Friendly and prompt solution with local taxes.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Wide Range of Designs</h3>
              <p className="text-gray-700">Explore endless styles and choices.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Custom Design Options</h3>
              <p className="text-gray-700">Bring your vision, we'll bring it to life.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Minimum Order - Just 1 Piece</h3>
              <p className="text-gray-700">Perfect for small to large-and-more.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Affordable Pricing</h3>
              <p className="text-gray-700">Great quality, without breaking your budget.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-2 text-gray-900">• Young, Creative Team</h3>
              <p className="text-gray-700">Fully passionate about what they do. (unique)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">Our Journey</h2>
              <p className="text-lg text-gray-700 mb-4">
                Established in 2024, SKAY Printing Services has quickly become a trusted name in commercial printing and custom merchandise. With over 2 years of experience, we've successfully completed 500+ projects for satisfied clients across various industries.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                What started as a vision to provide high-quality, affordable printing solutions has evolved into a comprehensive service offering everything from custom apparel and embroidery to corporate gifting and standard printing.
              </p>
              <p className="text-lg text-gray-700">
                Our expertise spans both traditional paper printing and modern textile customization, making us your one-stop solution for all branding and promotional needs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-500 text-white p-8 rounded-lg">
                <div className="text-4xl mb-2">500+</div>
                <div className="text-sm">Happy Clients</div>
              </div>
              <div className="bg-gray-900 text-white p-8 rounded-lg">
                <div className="text-4xl mb-2">500+</div>
                <div className="text-sm">Projects Done</div>
              </div>
              <div className="bg-gray-900 text-white p-8 rounded-lg">
                <div className="text-4xl mb-2">2+</div>
                <div className="text-sm">Years Experience</div>
              </div>
              <div className="bg-orange-500 text-white p-8 rounded-lg">
                <div className="text-4xl mb-2">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-orange-100 p-4 rounded-full">
                      <Icon size={32} className="text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-xl mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-12 rounded-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl mb-6">
                2+ Years of Market Expertise
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Our experience in both printing and embroidery allows us to handle projects of any complexity. From single custom pieces to bulk orders of 1000+ units, we maintain the same level of quality and attention to detail.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm">Paper Printing</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm">Textile Printing</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm">Embroidery</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-sm">Corporate Gifting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}