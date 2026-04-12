// Cart service for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('customerToken');

export const cartService = {
  // Get user's cart
  async getCart() {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  // Add item to cart
  async addItem(productId: string, name: string, price: number, quantity: number, image: string, category: string) {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, name, price, quantity, image, category }),
    });
    if (!response.ok) throw new Error('Failed to add item to cart');
    return response.json();
  },

  // Remove item from cart
  async removeItem(productId: string) {
    const response = await fetch(`${API_URL}/cart/remove`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) throw new Error('Failed to remove item from cart');
    return response.json();
  },

  // Update cart item quantity
  async updateQuantity(productId: string, quantity: number) {
    const response = await fetch(`${API_URL}/cart/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart');
    return response.json();
  },

  // Clear cart
  async clearCart() {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to clear cart');
    return response.json();
  },
};
