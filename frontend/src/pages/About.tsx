import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Award, Target, Zap, Heart } from 'lucide-react';

export function About() {
  const values = [
    { icon: Award, title: 'Quality', description: 'We never compromise on the quality of materials and printing techniques.' },
    { icon: Zap, title: 'Speed', description: 'Fast turnaround times without sacrificing quality or attention to detail.' },
    { icon: Target, title: 'Customization', description: 'Every project is unique. We tailor solutions to your specific needs.' },
    { icon: Heart, title: 'Customer Focus', description: '24/7 support and dedicated service for every client, big or small.' },
  ];

  const whyUs = [
    { title: 'Timely Delivery', desc: 'We value your time and ensure punctual deliveries.' },
    { title: 'High-Quality Products', desc: 'Premium materials and durable, elite-grade items.' },
    { title: 'Customer-Centric Support', desc: 'Friendly and prompt solution with local taxes.' },
    { title: 'Wide Range of Designs', desc: 'Explore endless styles and choices.' },
    { title: 'Custom Design Options', desc: "Bring your vision, we'll bring it to life." },
    { title: 'Minimum Order — Just 1 Piece', desc: 'Perfect for small to large-and-more.' },
    { title: 'Affordable Pricing', desc: 'Great quality, without breaking your budget.' },
    { title: 'Young, Creative Team', desc: 'Fully passionate about what they do.' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-5">
              About SKAY
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Your trusted partner for premium printing and custom merchandise since 2024.
            </p>
          </div>
        </div>
      </section>

      {/* About SKAY */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
                  ABOUT SKAY
                </h2>
                <p className="text-xl text-pink-300 font-medium">Where vision meets reality!</p>
              </div>
              <div className="space-y-5 text-white/70 text-lg leading-relaxed">
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

      {/* Why Choose Us */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              WHY CHOOSE US?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-5 border-l-4 border-l-pink-500 hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="text-base font-bold text-white mb-1">• {item.title}</h3>
                <p className="text-white/55 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Journey</h2>
              <div className="space-y-4 text-white/65 leading-relaxed">
                <p>
                  Established in 2024, SKAY Printing Services has quickly become a trusted name in commercial printing and custom merchandise. With over 2 years of experience, we've successfully completed 500+ projects for satisfied clients across various industries.
                </p>
                <p>
                  What started as a vision to provide high-quality, affordable printing solutions has evolved into a comprehensive service offering everything from custom apparel and embroidery to corporate gifting and standard printing.
                </p>
                <p>
                  Our expertise spans both traditional paper printing and modern textile customization, making us your one-stop solution for all branding and promotional needs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Happy Clients', gradient: 'from-pink-500 to-purple-500' },
                { value: '500+', label: 'Projects Done', gradient: 'from-purple-500 to-indigo-500' },
                { value: '2+', label: 'Years Experience', gradient: 'from-indigo-500 to-purple-500' },
                { value: '24/7', label: 'Support', gradient: 'from-purple-500 to-pink-500' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.gradient} p-8 rounded-2xl text-white shadow-lg`}>
                  <div className="text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
              Our Core Values
            </h2>
            <p className="text-white/50">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 p-4 rounded-2xl">
                      <Icon size={28} className="text-pink-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Banner */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-white/15 rounded-3xl p-10 md:p-14">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
                2+ Years of Market Expertise
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Our experience in both printing and embroidery allows us to handle projects of any complexity. From single custom pieces to bulk orders of 1000+ units, we maintain the same level of quality and attention to detail.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Paper Printing', 'Textile Printing', 'Embroidery', 'Corporate Gifting'].map((item) => (
                  <div key={item} className="bg-white/10 border border-white/15 rounded-xl p-4">
                    <div className="text-2xl mb-2">✓</div>
                    <div className="text-white/70 text-sm">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
