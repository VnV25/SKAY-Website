import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Phone, Mail, MapPin, Clock, Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeedbackForm } from '../components/FeedbackForm';

export function Contact() {
  const contactItems = [
    {
      icon: Phone,
      title: 'Phone Numbers',
      content: (
        <div className="space-y-1 text-white/65 text-sm">
          <p>Kamlesh Aher: 075175 72975</p>
          <p>Yogesh Barure: 9322938003</p>
          <p>Suraj Nawale: +91 95275 07300</p>
          <p>Amit Khartode: +91 77967 75058</p>
          <p className="text-white/40 text-xs mt-1">Mon–Sat: 9:00 AM – 8:00 PM</p>
        </div>
      ),
    },
    {
      icon: Mail,
      title: 'Email Address',
      content: (
        <div className="text-white/65 text-sm">
          <p>contact@skayprinting.com</p>
          <p className="text-white/40 text-xs mt-1">We'll respond within 24 hours</p>
        </div>
      ),
    },
    {
      icon: MapPin,
      title: 'Our Location',
      content: (
        <div className="text-white/65 text-sm">
          <p>Ekdant Corner, nearby Polyhub Food Court,</p>
          <p>Skncoe College, Vadgaon Badruk-411041, Pune</p>
          <p className="text-white/40 text-xs mt-1">Visit us for samples and consultation</p>
        </div>
      ),
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: (
        <div className="text-white/65 text-sm">
          <p>Monday – Saturday: 9:00 AM – 8:00 PM</p>
          <p>Sunday: 10:00 AM – 6:00 PM</p>
          <p className="text-pink-400 text-xs mt-1 font-medium">24/7 Online Support Available</p>
        </div>
      ),
    },
  ];

  const faqs = [
    { q: 'What is the minimum order quantity?', a: 'We accept orders starting from as low as 1 piece for most items. Bulk discounts are available for larger quantities.' },
    { q: 'How long does it take to complete an order?', a: 'Standard orders typically take 3–7 business days. Rush orders can be accommodated with additional charges. Timeline varies based on product type and quantity.' },
    { q: 'Do you provide design services?', a: "Yes! Our design team can help create custom designs for your products. Just share your ideas and we'll bring them to life." },
    { q: 'What file formats do you accept?', a: 'We accept JPG, PNG, PDF, AI, PSD, and other common formats. For best results, provide high-resolution vector files (AI or PDF).' },
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
              Contact Us
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Get in touch with our team. We're here to help bring your ideas to life.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Left — Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
              <div className="space-y-4">
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-5 flex items-start gap-4">
                      <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 p-3 rounded-xl flex-shrink-0">
                        <Icon size={20} className="text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm mb-1.5">{item.title}</h3>
                        {item.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social */}
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/skay.officials/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3.5 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 shadow-lg shadow-pink-500/25"
                  >
                    <Instagram size={22} />
                  </a>
                  <a
                    href="https://wa.me/919527507300"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500/80 border border-green-400/30 text-white p-3.5 rounded-xl hover:bg-green-500 hover:scale-105 transition-all duration-200"
                  >
                    <MessageCircle size={22} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Map + CTA */}
            <div className="space-y-5">
              <div className="rounded-2xl overflow-hidden border border-white/15 h-64">
                <iframe
                  src="https://maps.google.com/maps?q=Ekdant%20Corner%2C%20nearby%20Polyhub%20Food%20Court%2C%20Skncoe%20College%2C%20Vadgaon%20Badruk-411041%2C%20Pune&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SKAY Printing Services Location"
                />
              </div>

              {/* Quote CTA */}
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-white/15 rounded-2xl p-7">
                <h3 className="text-xl font-bold text-white mb-3">Need a Quick Quote?</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">
                  For detailed project requirements, use our quote form to get a comprehensive estimate within 24 hours.
                </p>
                <Link
                  to="/quote"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-200 inline-block font-semibold text-sm shadow-lg shadow-pink-500/25"
                >
                  Request Quote Now
                </Link>
              </div>

              {/* WhatsApp */}
              <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="text-green-400" size={28} />
                  <h3 className="text-lg font-semibold text-white">Chat on WhatsApp</h3>
                </div>
                <p className="text-white/55 text-sm mb-4">
                  Get instant responses to your queries. Click below to start a conversation.
                </p>
                <a
                  href="https://wa.me/919322938003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500/80 border border-green-400/30 text-white px-5 py-2.5 rounded-xl hover:bg-green-500 transition-all duration-200 inline-flex items-center gap-2 text-sm font-semibold"
                >
                  <MessageCircle size={16} />
                  Open WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-3">
              Share Your Experience
            </h2>
            <p className="text-white/50">Worked with us? We'd love to hear from you</p>
          </div>
          <FeedbackForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
