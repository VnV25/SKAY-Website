import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../context/ShopContext';
import { Edit2, Trash2, Save, X, Plus, TrendingUp, Star } from 'lucide-react';

export function AdminProducts() {
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { products, updateProduct, deleteProduct, addProduct, resetProducts } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
    if (!adminUser || !adminToken) {
      navigate('/admin');
    } else {
      setIsLoading(false);
    }
  }, [adminUser, navigate]);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      updateProduct(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      showSaved();
    }
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    showSaved();
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header mode="admin" />

      {/* Header */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl mb-2">Product Management</h1>
              <p className="opacity-90">Manage inventory, pricing, discounts & stock levels</p>
            </div>
            {saved && (
              <div className="bg-green-500 px-4 py-2 rounded-md flex items-center gap-2">
                <Save size={20} />
                Saved!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Actions */}
      <section className="py-6 bg-white shadow-sm sticky top-[120px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              {['all', 'apparel', 'gifts', 'corporate', 'printing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    filter === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({cat === 'all' ? products.length : products.filter(p => p.category === cat).length})
                </button>
              ))}
            </div>
            <button
              onClick={resetProducts}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </section>

      {/* Products Table */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reviews</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      {editingId === product.id ? (
                        <>
                          {/* Edit Mode */}
                          <td className="px-4 py-3">
                            <div>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                              <div className="text-xs text-gray-500 mt-1">{product.category}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <input
                                type="number"
                                value={editForm.price || 0}
                                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-sm"
                                placeholder="Price"
                              />
                              <input
                                type="number"
                                value={editForm.originalPrice || 0}
                                onChange={(e) => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-sm"
                                placeholder="Original"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.discount || 0}
                              onChange={(e) => setEditForm({ ...editForm, discount: Number(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-sm"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.stock || 0}
                              onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.rating || 0}
                              onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-sm"
                              min="0"
                              max="5"
                              step="0.1"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editForm.reviews || 0}
                              onChange={(e) => setEditForm({ ...editForm, reviews: Number(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-sm"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editForm.trending || false}
                                onChange={(e) => setEditForm({ ...editForm, trending: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-xs">Trending</span>
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* View Mode */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-semibold text-orange-500">₹{product.price}</div>
                              {product.originalPrice && (
                                <div className="text-xs text-gray-400 line-through">₹{product.originalPrice}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {product.discount ? (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                                {product.discount}% OFF
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${
                              product.stock <= 3 ? 'text-red-500' : 
                              product.stock <= 10 ? 'text-orange-500' : 
                              'text-green-500'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{product.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">{product.reviews}</span>
                          </td>
                          <td className="px-4 py-3">
                            {product.trending && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                <TrendingUp size={12} />
                                Trending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found in this category
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-orange-500">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-500">
                {products.filter(p => p.stock > 10).length}
              </div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-orange-500">
                {products.filter(p => p.stock <= 10 && p.stock > 0).length}
              </div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-red-500">
                {products.filter(p => p.stock === 0).length}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
