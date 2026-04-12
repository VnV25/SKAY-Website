export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: ServiceItem[];
}

export interface ServiceItem {
  name: string;
  description: string;
  features?: string[];
  minOrder?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  stock?: number;
  image?: string;
  trending?: boolean;
  sizes?: string[];
  colors?: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'apparel',
    name: 'Custom Apparel Printing',
    description: 'Printing and customization of clothing items with various techniques',
    icon: '👕',
    items: [
      {
        name: 'Custom T-Shirts',
        description: 'Premium quality t-shirts with custom printing',
        features: ['Logo printing', 'Design printing', 'Embroidery', 'Custom colors', 'Custom patterns'],
        price: 299,
        originalPrice: 499,
        discount: 40,
        rating: 4.9,
        reviews: 543,
        stock: 100,
        image: '/assets/polo.jpg',
        trending: true,
      },
      {
        name: 'Polo T-Shirts',
        description: 'Professional polo shirts for corporate and events',
        features: ['Collar embroidery', 'Logo printing', 'Multiple color options'],
        price: 449,
        originalPrice: 699,
        discount: 36,
        rating: 4.8,
        reviews: 321,
        stock: 75,
        image: '/assets/polo.jpg',
      },
      {
        name: 'Hoodies',
        description: 'Comfortable hoodies with customization options',
        features: ['Front/back printing', 'Embroidery', 'Custom colors', 'Zipper/pullover options'],
        price: 699,
        originalPrice: 999,
        discount: 30,
        rating: 4.9,
        reviews: 412,
        stock: 60,
        image: '/assets/hoodie.jpg',
        trending: true,
      },
      {
        name: 'Sports Jerseys',
        description: 'Team jerseys with custom designs and numbers',
        features: ['Player names', 'Team logos', 'Number printing', 'Custom team colors'],
        price: 549,
        originalPrice: 899,
        discount: 39,
        rating: 4.8,
        reviews: 267,
        stock: 45,
        image: '/assets/jersey.jpg',
      },
    ],
  },
  {
    id: 'merchandise',
    name: 'Customized Merchandise',
    description: 'Personalized everyday merchandise with customer designs',
    icon: '🎁',
    items: [
      {
        name: 'Photo Mugs',
        description: 'Ceramic mugs with photos, logos, or custom graphics',
        features: ['Full-color printing', 'Magic mugs available', 'Dishwasher safe'],
        price: 199,
        originalPrice: 349,
        discount: 43,
        rating: 4.7,
        reviews: 689,
        stock: 150,
        image: '/assets/mug.jpg',
        trending: true,
      },
      {
        name: 'Custom Bottles',
        description: 'Stainless steel and plastic bottles with branding',
        features: ['Logo engraving', 'Full-color printing', 'Insulated options'],
        price: 349,
        originalPrice: 599,
        discount: 42,
        rating: 4.8,
        reviews: 445,
        stock: 80,
        image: '/assets/bottle.jpg',
      },
      {
        name: 'Wall Clocks',
        description: 'Personalized wall clocks with photos or designs',
        features: ['Custom photo printing', 'Logo placement', 'Multiple sizes'],
        price: 499,
        originalPrice: 799,
        discount: 38,
        rating: 4.6,
        reviews: 178,
        stock: 40,
        image: '/assets/clock.jpg',
      },
      {
        name: 'Tote Bags',
        description: 'Eco-friendly bags with custom printing',
        features: ['Screen printing', 'Full-color printing', 'Various sizes'],
        price: 249,
        originalPrice: 399,
        discount: 38,
        rating: 4.7,
        reviews: 534,
        stock: 120,
        image: '/assets/bag.jpg',
      },
      {
        name: 'Umbrellas',
        description: 'Branded umbrellas for corporate gifting',
        features: ['Logo printing', 'Multiple colors', 'Durable quality'],
        price: 399,
        originalPrice: 649,
        discount: 39,
        rating: 4.5,
        reviews: 203,
        stock: 55,
        image: '/assets/umbrella.jpg',
      },
      {
        name: 'Keychains',
        description: 'Metal, acrylic, and wooden keychains',
        features: ['Logo engraving', 'Custom shapes', 'Multiple materials'],
        price: 99,
        originalPrice: 199,
        discount: 50,
        rating: 4.6,
        reviews: 892,
        stock: 200,
        image: '/assets/keychain.jpg',
      },
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate Merchandise Services',
    description: 'Products created for organizations and businesses',
    icon: '💼',
    items: [
      {
        name: 'Corporate T-Shirts',
        description: 'Branded apparel for company events and employees',
        features: ['Company logo', 'Custom designs', 'Bulk discounts'],
        image: '/assets/corporate.jpg',
      },
      {
        name: 'Company Merchandise',
        description: 'Complete branding solutions for businesses',
        features: ['Notebooks', 'Pens', 'Folders', 'Business cards', 'Visiting cards'],
        image: '/assets/company.jpg',
      },
      {
        name: 'Employee Gift Items',
        description: 'Personalized gifts for employee recognition',
        features: ['Gift sets', 'Custom packaging', 'Bulk orders'],
        image: '/assets/gifts.jpg',
      },
      {
        name: 'Corporate Branding Products',
        description: 'Full range of promotional items with company branding',
        features: ['Marketing materials', 'Promotional items', 'Brand consistency'],
        image: '/assets/corporate.jpg',
      },
    ],
  },
  {
    id: 'institutional',
    name: 'Institutional Merchandise',
    description: 'Products for educational and organizational institutions',
    icon: '🎓',
    items: [
      {
        name: 'School Merchandise',
        description: 'Custom products for schools and educational institutions',
        features: ['School uniforms', 'ID cards', 'Bags', 'Notebooks', 'School logos'],
        image: '/assets/school.png',
      },
      {
        name: 'College Merchandise',
        description: 'College fest and event merchandise',
        features: ['College fest t-shirts', 'Event merchandise', 'Club merchandise'],
        image: '/assets/college.jpg',
      },
      {
        name: 'Club Merchandise',
        description: 'Custom items for clubs and organizations',
        features: ['Club logos', 'Member merchandise', 'Event items'],
        image: '/assets/club.jpg',
      },
      {
        name: 'Team Jerseys',
        description: 'Sports team jerseys with customization',
        features: ['Team names', 'Player numbers', 'Custom colors', 'Logo placement'],
        image: '/assets/team.jpg',
      },
    ],
  },
  {
    id: 'bulk',
    name: 'Bulk Orders',
    description: 'Large quantity customized products for events or organizations',
    icon: '📦',
    items: [
      {
        name: 'Event Merchandise',
        description: 'Custom products for events and conferences',
        features: ['Event branding', 'Participant gifts', 'Promotional items'],
        minOrder: 'Minimum 5 pieces',
        image: '/assets/event.jpeg',
      },
      {
        name: 'College Fest Merchandise',
        description: 'Merchandise for college festivals and cultural events',
        features: ['Custom designs', 'Fast turnaround', 'Bulk pricing'],
        minOrder: 'Minimum 5 pieces',
        image: '/assets/college.jpg',
      },
      {
        name: 'Corporate Event Merchandise',
        description: 'Products for corporate events, conferences, and seminars',
        features: ['Professional branding', 'Custom packaging', 'Timely delivery'],
        minOrder: 'Minimum 5 pieces',
        image: '/assets/corporate.jpg',
      },
      {
        name: 'Promotional Products',
        description: 'Marketing and promotional merchandise',
        features: ['Brand visibility', 'Marketing campaigns', 'Trade show items'],
        minOrder: 'Minimum 5 pieces',
        image: '/assets/promotion.jpeg',
      },
    ],
  },
  {
    id: 'custom-design',
    name: 'Custom Design Services',
    description: 'SKAY allows customers to bring their own design or request customization',
    icon: '🎨',
    items: [
      {
        name: 'Upload Your Design',
        description: 'Bring your own artwork or design',
        features: ['Accept AI, PSD, PDF, JPG', 'Design review', 'Print-ready conversion'],
        image: '/assets/jersey.jpg',
      },
      {
        name: 'Logo Printing',
        description: 'Professional logo printing on any product',
        features: ['Vector conversion', 'Color matching', 'Multiple printing techniques'],
        image: '/assets/logo.jpg',
      },
      {
        name: 'Custom Artwork Printing',
        description: 'Print custom artwork and graphics',
        features: ['Full-color printing', 'Design placement', 'Quality assurance'],
        image: '/assets/jersey.jpg',
      },
      {
        name: 'Brand Design Printing',
        description: 'Complete branding solutions',
        features: ['Brand guidelines', 'Consistent quality', 'Professional finish'],
        image: '/assets/brand.jpg',
      },
    ],
  },
  {
    id: 'printing-embroidery',
    name: 'Printing & Embroidery',
    description: 'Different techniques used to apply designs on products',
    icon: '✨',
    items: [
      {
        name: 'Fabric Printing',
        description: 'High-quality printing on fabric materials',
        features: ['Screen printing', 'Digital printing', 'Heat transfer', 'Sublimation'],
        image: '/assets/polo.jpg',
      },
      {
        name: 'Embroidery',
        description: 'Premium embroidery services for apparel',
        features: ['Logo embroidery', 'Name stitching', 'Custom patterns', 'Thread colors'],
        image: '/assets/hoodie.jpg',
      },
      {
        name: 'Logo Printing',
        description: 'Specialized logo printing services',
        features: ['Print anywhere', 'Multiple techniques', 'Color accuracy'],
        image: '/assets/logo.jpg',
      },
      {
        name: 'Graphic Printing',
        description: 'Full-color graphic printing',
        features: ['Complex designs', 'Gradients', 'Photo printing', 'High resolution'],
        image: '/assets/jersey.jpg',
      },
    ],
  },
  {
    id: 'custom-manufacturing',
    name: 'Custom Color & Pattern',
    description: 'SKAY offers flexibility in product appearance',
    icon: '🎨',
    items: [
      {
        name: 'Custom Fabric Colors',
        description: 'Choose from wide range of fabric colors',
        features: ['Pantone matching', 'Custom dye colors', 'Color consistency'],
        image: '/assets/polo.jpg',
      },
      {
        name: 'Custom Apparel Patterns',
        description: 'Unique patterns and designs',
        features: ['Pattern design', 'Repeat patterns', 'All-over printing'],
        image: '/assets/jersey.jpg',
      },
      {
        name: 'Custom Color Combinations',
        description: 'Multi-color product customization',
        features: ['Color blocking', 'Gradient colors', 'Mixed patterns'],
        image: '/assets/team.jpg',
      },
    ],
  },
];

export const clientCategories = [
  {
    name: 'Corporates',
    icon: '🏢',
    description: 'Professional branding and employee merchandise',
  },
  {
    name: 'Schools',
    icon: '🏫',
    description: 'School uniforms, merchandise, and events',
  },
  {
    name: 'Colleges',
    icon: '🎓',
    description: 'College fests, clubs, and student merchandise',
  },
  {
    name: 'Banks',
    icon: '🏦',
    description: 'Corporate gifting and employee merchandise',
  },
  {
    name: 'Hospitals',
    icon: '🏥',
    description: 'Staff uniforms and institutional merchandise',
  },
  {
    name: 'Clubs',
    icon: '⚽',
    description: 'Team jerseys, club merchandise, and events',
  },
  {
    name: 'Organizations',
    icon: '🌐',
    description: 'Custom merchandise for any organization',
  },
];