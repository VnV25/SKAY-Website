import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckCircle, Clock, Users, Headphones, ArrowRight } from 'lucide-react';

export function Home() {
  const stats = [
    { icon: CheckCircle, value: '500+', label: 'Projects Completed' },
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: Clock, value: '2 Years+', label: 'Experience' },
    { icon: Headphones, value: '24/7', label: 'Support Services' },
  ];

  const featuredServices = [
    {
      title: 'Custom T-Shirts',
      description: 'Oversized & Normal fit with premium printing',
      image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBwcmludGVkJTIwdHNoaXJ0cyUyMGFwcGFyZWx8ZW58MXx8fHwxNzcwNzQ3NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'Custom Mugs',
      description: 'Coffee & Magic mugs with personalized designs',
      image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmludGVkJTIwY29mZmVlJTIwbXVncyUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc3MDc0NzYyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'Hoodies & Embroidery',
      description: 'High-quality embroidery works on apparel',
      image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBlbWJyb2lkZXJ5JTIwaG9vZGllc3xlbnwxfHx8fDE3NzA3NDc2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      title: 'Corporate Gifting',
      description: 'Professional gift sets for businesses',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    },
    {
      title: 'School Uniforms',
      description: 'Bulk orders for educational institutions',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
    },
    {
      title: 'Standard Printing',
      description: 'Documents, brochures & marketing materials',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Tech Solutions Inc.',
      text: 'SKAY delivered 200+ branded t-shirts for our corporate event. Quality was exceptional!',
    },
    {
      name: 'Priya Sharma',
      company: 'Green Valley School',
      text: 'Best embroidery work on our school uniforms. Very professional and timely delivery.',
    },
    {
      name: 'Amit Patel',
      company: 'Marketing Pro',
      text: 'Their magic mugs are a hit with our clients. Great for corporate gifting!',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm mb-4">
                Since 2024
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
                Premium Printing & Custom Gifting Solutions
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                From paper to fabric, we bring your brand to life with high-quality printing and custom merchandise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/quote"
                  className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                >
                  Get a Quote <ArrowRight size={20} />
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-md hover:bg-orange-50 transition-colors"
                >
                  Explore Products
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1577876050215-134d70691e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBwcmludGVkJTIwdHNoaXJ0cyUyMGFwcGFyZWx8ZW58MXx8fHwxNzcwNzQ3NjI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Custom Apparel"
                className="rounded-lg shadow-xl w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1539042357369-956fb344118f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmludGVkJTIwY29mZmVlJTIwbXVncyUyMG1lcmNoYW5kaXNlfGVufDF8fHx8MTc3MDc0NzYyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Custom Merchandise"
                className="rounded-lg shadow-xl w-full h-64 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <Icon size={40} className="text-orange-400" />
                  </div>
                  <div className="text-3xl md:text-4xl mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">
              Wide range of printing and customization solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link
                    to="/services"
                    className="text-orange-500 hover:text-orange-600 inline-flex items-center gap-1"
                  >
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">
              Trusted by 500+ happy clients
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-orange-400 mb-4 text-4xl">"</div>
                <p className="text-gray-700 mb-6">{testimonial.text}</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6">
            Ready to Start Your Custom Project?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get a free quote today and bring your ideas to life
          </p>
          <Link
            to="/quote"
            className="bg-white text-orange-500 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Request Quote <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
