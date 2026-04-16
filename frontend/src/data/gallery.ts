// Gallery items with local image paths
// Update image paths after adding images to src/assets/products/gallery/

export interface GalleryItem {
  id: number;
  category: 'apparel' | 'mugs' | 'corporate' | 'embroidery';
  image: string; // Update these paths as you add images from brochure
  title: string;
  description: string;
}

export const galleryItems: GalleryItem[] = [
  // Apparel Projects
  {
    id: 1,
    category: 'apparel',
    image: '/assets/polo.jpg',
    // Local path once you add image: image: require('@/assets/products/gallery/apparel-1.jpg'),
    title: 'Custom Printed T-Shirts',
    description: 'Bulk order of 200 units for Tech Solutions Inc.',
  },
  {
    id: 2,
    category: 'apparel',
    image: '/assets/hoodie.jpg',
    title: 'Custom Hoodies',
    description: 'Oversized hoodies with screen printing',
  },
  {
    id: 3,
    category: 'apparel',
    image: '/assets/uniform.jpg',
    title: 'Branded Caps',
    description: 'Logo embroidered caps for event',
  },
  {
    id: 4,
    category: 'apparel',
    image: '/assets/hoodie1.jpeg',
    title: 'School Uniforms',
    description: 'Complete uniform set for Green Valley School',
  },

  // Mugs & Gifts
  {
    id: 5,
    category: 'mugs',
    image: '/assets/mug.jpg',
    title: 'Branded Coffee Mugs',
    description: 'Corporate gifting set with logo printing',
  },
  {
    id: 6,
    category: 'mugs',
    image: '/assets/keychain.jpg',
    title: 'Personalized Merchandise',
    description: 'Custom designed promotional items',
  },
  {
    id: 7,
    category: 'mugs',
    image: '/assets/gifts.jpg',
    title: 'Magic Mugs',
    description: 'Heat-activated color changing mugs',
  },

  // Embroidery
  {
    id: 8,
    category: 'embroidery',
    image: '/assets/school.png',
    title: 'Embroidered Hoodies',
    description: 'Premium embroidery work for sports team',
  },
  {
    id: 9,
    category: 'embroidery',
    image: '/assets/umbrella.jpg',
    title: 'School Uniform Embroidery',
    description: 'Name stitching on 150 school uniforms',
  },

  // Corporate
  {
    id: 10,
    category: 'corporate',
    image: '/assets/corporate.jpg',
    title: 'Corporate Gift Set',
    description: 'Executive gifting kit for client appreciation',
  },
  {
    id: 11,
    category: 'corporate',
    image: '/assets/college.jpg',
    title: 'Marketing Materials',
    description: 'Brochures and promotional printing',
  },
  {
    id: 12,
    category: 'corporate',
    image: '/assets/event.jpeg',
    title: 'Document Printing',
    description: 'Professional business document printing',
  },
];
