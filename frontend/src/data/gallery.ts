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
    image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600',
    // Local path once you add image: image: require('@/assets/products/gallery/apparel-1.jpg'),
    title: 'Custom Printed T-Shirts',
    description: 'Bulk order of 200 units for Tech Solutions Inc.',
  },
  {
    id: 2,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
    title: 'Custom Hoodies',
    description: 'Oversized hoodies with screen printing',
  },
  {
    id: 3,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1728925962995-c5a11993564a?w=600',
    title: 'Branded Caps',
    description: 'Logo embroidered caps for event',
  },
  {
    id: 4,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
    title: 'School Uniforms',
    description: 'Complete uniform set for Green Valley School',
  },

  // Mugs & Gifts
  {
    id: 5,
    category: 'mugs',
    image: 'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
    title: 'Branded Coffee Mugs',
    description: 'Corporate gifting set with logo printing',
  },
  {
    id: 6,
    category: 'mugs',
    image: 'https://images.unsplash.com/photo-1768784919500-1d567af12afb?w=600',
    title: 'Personalized Merchandise',
    description: 'Custom designed promotional items',
  },
  {
    id: 7,
    category: 'mugs',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    title: 'Magic Mugs',
    description: 'Heat-activated color changing mugs',
  },

  // Embroidery
  {
    id: 8,
    category: 'embroidery',
    image: 'https://images.unsplash.com/photo-1664206244464-5b757a8c51a1?w=600',
    title: 'Embroidered Hoodies',
    description: 'Premium embroidery work for sports team',
  },
  {
    id: 9,
    category: 'embroidery',
    image: 'https://images.unsplash.com/photo-1762417582301-07023561d839?w=600',
    title: 'School Uniform Embroidery',
    description: 'Name stitching on 150 school uniforms',
  },

  // Corporate
  {
    id: 10,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1762504381997-3ddd51f135b8?w=600',
    title: 'Corporate Gift Set',
    description: 'Executive gifting kit for client appreciation',
  },
  {
    id: 11,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1559268191-087643399ef8?w=600',
    title: 'Marketing Materials',
    description: 'Brochures and promotional printing',
  },
  {
    id: 12,
    category: 'corporate',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
    title: 'Document Printing',
    description: 'Professional business document printing',
  },
];
