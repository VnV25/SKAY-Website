import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router';
import { Shirt, Coffee, Gift, FileText, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'apparel',
      title: 'Apparel & Textiles',
      icon: Shirt,
      color: 'orange',
      items: [
        {
          name: 'T-Shirts',
          description: 'Custom printed t-shirts in oversized and normal fit',
          options: ['Oversized Fit', 'Normal Fit', 'Round Neck', 'V-Neck', 'Polo'],
          price: 'Starting ₹299',
          image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600',
        },
        {
          name: 'Hoodies',
          description: 'Premium hoodies with printing or embroidery',
          options: ['Pullover', 'Zip-up', 'Fleece', 'Cotton Blend'],
          price: 'Starting ₹799',
          image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
        },
        {
          name: 'Caps',
          description: 'Customized caps with your logo or design',
          options: ['Baseball Cap', 'Snapback', 'Trucker Cap', 'Beanie'],
          price: 'Starting ₹199',
          image: 'https://images.unsplash.com/photo-1728925962995-c5a11993564a?w=600',
        },
        {
          name: 'School Uniforms',
          description: 'Bulk orders for educational institutions',
          options: ['Shirts', 'Pants', 'Skirts', 'Blazers'],
          price: 'Bulk Pricing Available',
          image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
        },
        {
          name: 'Embroidery Works',
          description: 'Professional embroidery on any fabric',
          options: ['Logo Embroidery', 'Name Stitching', 'Custom Designs'],
          price: 'Starting ₹99',
          image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
        },
      ],
    },
    {
      id: 'gifts',
      title: 'Personalized Gifts',
      icon: Coffee,
      color: 'blue',
      items: [
        {
          name: 'Coffee Mugs',
          description: 'Custom printed ceramic mugs',
          options: ['White', 'Color Inside', 'Glossy', 'Matte Finish'],
          price: 'Starting ₹149',
          image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
        },
        {
          name: 'Magic Mugs',
          description: 'Heat-activated color changing mugs',
          options: ['Black to Color', 'Blue to Color', 'Red to Color'],
          price: 'Starting ₹299',
          image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
        },
        {
          name: 'Water Bottles',
          description: 'Customized stainless steel and plastic bottles',
          options: ['Steel Bottle', 'Sipper', 'Sports Bottle', 'Insulated'],
          price: 'Starting ₹199',
          image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
        },
        {
          name: 'Keychains',
          description: 'Metal, acrylic, and wooden keychains',
          options: ['Metal', 'Acrylic', 'Wooden', 'Leather'],
          price: 'Starting ₹49',
          image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600',
        },
        {
          name: 'Photo Frames',
          description: 'Custom printed photo frames',
          options: ['4x6"', '5x7"', '8x10"', 'Collage Frame'],
          price: 'Starting ₹199',
          image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
        },
        {
          name: 'Pillows',
          description: 'Custom printed cushions and pillows',
          options: ['Square', 'Rectangle', 'Heart Shape', 'Round'],
          price: 'Starting ₹299',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        },
      ],
    },
    {
      id: 'corporate',
      title: 'Corporate & Branding',
      icon: Gift,
      color: 'purple',
      items: [
        {
          name: 'Corporate Gifting Kits',
          description: 'Curated gift sets for employees and clients',
          options: ['Executive Kit', 'Welcome Kit', 'Festival Kit', 'Custom Kit'],
          price: 'Starting ₹999',
          image: 'https://images.unsplash.com/photo-1762504381997-3ddd51f135b8?w=600',
        },
        {
          name: 'Branding Materials',
          description: 'Complete branding solutions for businesses',
          options: ['Letterheads', 'Envelopes', 'ID Cards', 'Certificates'],
          price: 'Custom Pricing',
          image: 'https://images.unsplash.com/photo-1559268191-087643399ef8?w=600',
        },
      ],
    },
    {
      id: 'printing',
      title: 'Standard Printing',
      icon: FileText,
      color: 'green',
      items: [
        {
          name: 'Document Printing',
          description: 'Black & white and color document printing',
          options: ['B&W', 'Color', 'Single Side', 'Double Side'],
          price: 'Starting ₹2/page',
          image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        },
        {
          name: 'Marketing Materials',
          description: 'Brochures, flyers, and promotional materials',
          options: ['Brochures', 'Flyers', 'Posters', 'Banners'],
          price: 'Starting ₹5/piece',
          image: 'https://images.unsplash.com/photo-1559268191-087643399ef8?w=600',
        },
        {
          name: 'Visiting Cards',
          description: 'Professional business cards',
          options: ['Standard', 'Premium', 'Textured', 'Metallic'],
          price: 'Starting ₹199/100pcs',
          image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600',
        },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      orange: { bg: 'bg-orange-100', text: 'text-orange-500', hover: 'hover:bg-orange-50' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-500', hover: 'hover:bg-blue-50' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-500', hover: 'hover:bg-purple-50' },
      green: { bg: 'bg-green-100', text: 'text-green-500', hover: 'hover:bg-green-50' },
    };
    return colors[color] || colors.orange;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Our Services & Products</h1>
            <p className="text-xl text-gray-600">
              Comprehensive printing and customization solutions for all your needs
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className={`${colors.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  <h3 className="text-xl mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.items.length} Products</p>
                </button>
              );
            })}
          </div>

          {/* Products Display */}
          {categories.map((category) => {
            if (selectedCategory && selectedCategory !== category.id) return null;

            return (
              <div key={category.id} className="mb-16">
                <h2 className="text-3xl mb-8">{category.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm">
                          {item.price}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                        <div className="mb-4">
                          <div className="text-sm font-semibold mb-2">Available Options:</div>
                          <div className="flex flex-wrap gap-2">
                            {item.options.slice(0, 3).map((option, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 px-2 py-1 rounded"
                              >
                                {option}
                              </span>
                            ))}
                            {item.options.length > 3 && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                +{item.options.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to="/quote"
                          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors inline-flex items-center gap-2 w-full justify-center"
                        >
                          Get Quote <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white">
            <h3 className="text-2xl md:text-3xl mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-lg mb-6 opacity-90">
              We offer custom solutions for unique requirements. Contact us to discuss your project.
            </p>
            <Link
              to="/quote"
              className="bg-white text-orange-500 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Request Custom Quote <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
