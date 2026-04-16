import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Phone, Mail, MapPin, Clock, Instagram, MessageCircle, Linkedin } from 'lucide-react';

export function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Get in touch with our team. We're here to help bring your ideas to life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl mb-8">Get In Touch</h2>
              
              <div className="space-y-6">
                {/* Phone Numbers */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Phone className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-2">Phone Numbers</h3>
                    <p className="text-gray-700">Primary: +91 XXXXXXXXXX</p>
                    <p className="text-gray-700">Secondary: +91 XXXXXXXXXX</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Sat: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Mail className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-2">Email Address</h3>
                    <p className="text-gray-700">contact@skayprinting.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <MapPin className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-2">Our Location</h3>
                    <p className="text-gray-700">Shop Address</p>
                    <p className="text-gray-700">City, State - PIN Code</p>
                    <p className="text-sm text-gray-500 mt-1">Visit us for samples and consultation</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Clock className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-2">Business Hours</h3>
                    <p className="text-gray-700">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p className="text-gray-700">Sunday: 10:00 AM - 6:00 PM</p>
                    <p className="text-sm text-orange-500 mt-1">24/7 Online Support Available</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-lg mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 text-white p-4 rounded-full hover:bg-orange-600 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle size={24} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin size={24} />
                  </a>
                </div>
              </div>
            </div>

            {/* Map / Quick Contact Form */}
            <div>
              {/* Google Maps Placeholder */}
              <div className="bg-gray-200 rounded-lg overflow-hidden mb-6 h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.98823492346764!3d40.75889497138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SKAY Printing Services Location"
                ></iframe>
              </div>

              {/* Quick Contact Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-lg">
                <h3 className="text-2xl mb-4">Need a Quick Quote?</h3>
                <p className="mb-6 opacity-90">
                  For detailed project requirements, use our quote form to get a comprehensive estimate within 24 hours.
                </p>
                <a
                  href="/quote"
                  className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors inline-block"
                >
                  Request Quote Now
                </a>
              </div>

              {/* WhatsApp Direct */}
              <div className="mt-6 bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="text-green-600" size={32} />
                  <h3 className="text-xl">Chat with Us on WhatsApp</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Get instant responses to your queries. Click below to start a conversation.
                </p>
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                >
                  <MessageCircle size={20} />
                  Open WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg mb-2">What is the minimum order quantity?</h3>
              <p className="text-gray-600">
                We accept orders starting from as low as 1 piece for most items. Bulk discounts are available for larger quantities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg mb-2">How long does it take to complete an order?</h3>
              <p className="text-gray-600">
                Standard orders typically take 3-7 business days. Rush orders can be accommodated with additional charges. Timeline varies based on product type and quantity.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg mb-2">Do you provide design services?</h3>
              <p className="text-gray-600">
                Yes! Our design team can help create custom designs for your products. Just share your ideas and we'll bring them to life.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg mb-2">What file formats do you accept?</h3>
              <p className="text-gray-600">
                We accept JPG, PNG, PDF, AI, PSD, and other common formats. For best results, provide high-resolution vector files (AI or PDF).
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
