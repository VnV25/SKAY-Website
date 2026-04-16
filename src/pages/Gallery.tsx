import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useState } from 'react';

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'mugs', label: 'Mugs/Gifts' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'embroidery', label: 'Embroidery' },
  ];

  const galleryItems = [
    {
      id: 1,
      category: 'apparel',
      image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600',
      title: 'Custom Printed T-Shirts',
      description: 'Bulk order of 200 units for Tech Solutions Inc.',
    },
    {
      id: 2,
      category: 'mugs',
      image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
      title: 'Branded Coffee Mugs',
      description: 'Corporate gifting set with logo printing',
    },
    {
      id: 3,
      category: 'embroidery',
      image: 'https://images.unsplash.com/photo-1664206244464-5b757a8c51a1?w=600',
      title: 'Embroidered Hoodies',
      description: 'Premium embroidery work for sports team',
    },
    {
      id: 4,
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1762504381997-3ddd51f135b8?w=600',
      title: 'Corporate Gift Set',
      description: 'Executive gifting kit for client appreciation',
    },
    {
      id: 5,
      category: 'apparel',
      image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
      title: 'Custom Hoodies',
      description: 'Oversized hoodies with screen printing',
    },
    {
      id: 6,
      category: 'mugs',
      image: 'https://images.unsplash.com/photo-1768884919500-1d567af12afb?w=600',
      title: 'Personalized Merchandise',
      description: 'Custom designed promotional items',
    },
    {
      id: 7,
      category: 'apparel',
      image: 'https://images.unsplash.com/photo-1728925962995-c5a11993564a?w=600',
      title: 'Branded Caps',
      description: 'Logo embroidered caps for event',
    },
    {
      id: 8,
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1559268191-087643399ef8?w=600',
      title: 'Marketing Materials',
      description: 'Brochures and promotional printing',
    },
    {
      id: 9,
      category: 'embroidery',
      image: 'https://images.unsplash.com/photo-1762417582301-07023561d839?w=600',
      title: 'School Uniform Embroidery',
      description: 'Name stitching on 150 school uniforms',
    },
    {
      id: 10,
      category: 'mugs',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
      title: 'Magic Mugs',
      description: 'Heat-activated color changing mugs',
    },
    {
      id: 11,
      category: 'apparel',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
      title: 'School Uniforms',
      description: 'Complete uniform set for Green Valley School',
    },
    {
      id: 12,
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
      title: 'Document Printing',
      description: 'Professional business document printing',
    },
  ];

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Our Portfolio</h1>
            <p className="text-xl text-gray-600">
              Explore our collection of 500+ completed projects showcasing quality and creativity
            </p>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-white sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeFilter === filter.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-200">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No items found in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">500+</div>
              <div className="text-sm opacity-90">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl mb-2">500+</div>
              <div className="text-sm opacity-90">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl mb-2">2+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl mb-2">100%</div>
              <div className="text-sm opacity-90">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
