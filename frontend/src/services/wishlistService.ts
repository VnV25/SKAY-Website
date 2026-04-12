// Wishlist service for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('customerToken');

export const wishlistService = {
  // Get user's wishlist
  async getWishlist() {
    const response = await fetch(`${API_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  },

  // Add item to wishlist
  async addItem(productId: string, name: string, price: number, image: string, category: string) {
    const response = await fetch(`${API_URL}/wishlist/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, name, price, image, category }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add item to wishlist');
    }
    return response.json();
  },

  // Remove item from wishlist
  async removeItem(productId: string) {
    const response = await fetch(`${API_URL}/wishlist/remove`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) throw new Error('Failed to remove item from wishlist');
    return response.json();
  },

  // Clear wishlist
  async clearWishlist() {
    const response = await fetch(`${API_URL}/wishlist/clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to clear wishlist');
    return response.json();
  },
};
