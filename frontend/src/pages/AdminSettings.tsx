import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, Eye, EyeOff, Edit2 } from 'lucide-react';

export function AdminSettings() {
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { settings, testimonials, updateSettings, updateAnnouncement, addTestimonial, updateTestimonial, deleteTestimonial, toggleTestimonial } = useAdmin();
  const [saved, setSaved] = useState(false);

  // New testimonial form
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    company: '',
    text: '',
    rating: 5,
    enabled: true,
  });

  useEffect(() => {
    // 🔥 FIXED: Use consistent 'skay-admin-token' key
    const adminToken = localStorage.getItem('skay-admin-token');
    if (!adminUser || !adminToken) {
      navigate('/admin');
    } else {
      setIsLoading(false);
    }
  }, [adminUser, navigate]);

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
    showSaved();
  };

  const handleAnnouncementUpdate = (field: string, value: any) => {
    updateAnnouncement({ [field]: value });
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddTestimonial = () => {
    if (newTestimonial.name && newTestimonial.text) {
      addTestimonial(newTestimonial);
      setNewTestimonial({ name: '', company: '', text: '', rating: 5, enabled: true });
      showSaved();
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonial(id);
      showSaved();
    }
  };

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
              <h1 className="text-3xl mb-2">Site Settings & Features</h1>
              <p className="opacity-90">Manage all website features and content</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Announcement Bar Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl mb-6 flex items-center gap-2">
              📢 Announcement Bar
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Enable Announcement Bar</span>
                <button
                  onClick={() => handleAnnouncementUpdate('enabled', !settings.announcement.enabled)}
                  className={`px-4 py-2 rounded ${
                    settings.announcement.enabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {settings.announcement.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <label className="block text-sm mb-2">Announcement Text</label>
                <textarea
                  value={settings.announcement.text}
                  onChange={(e) => handleAnnouncementUpdate('text', e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Discount Code (Optional)</label>
                <input
                  type="text"
                  value={settings.announcement.discountCode || ''}
                  onChange={(e) => handleAnnouncementUpdate('discountCode', e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="e.g., SKAY40"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Background Style</label>
                <select
                  value={settings.announcement.backgroundColor}
                  onChange={(e) => handleAnnouncementUpdate('backgroundColor', e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="from-orange-600 to-red-600">Orange to Red</option>
                  <option value="from-blue-600 to-purple-600">Blue to Purple</option>
                  <option value="from-green-600 to-teal-600">Green to Teal</option>
                  <option value="from-pink-600 to-rose-600">Pink to Rose</option>
                  <option value="from-gray-800 to-gray-900">Dark Gray</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl mb-6">🎛️ Feature Toggles</h2>
            
            <div className="space-y-3">
              {[
                { key: 'showTrending', label: '⭐ Trending Products Section', icon: '⭐' },
                { key: 'showBundles', label: '🎯 Combo/Bundle Deals', icon: '🎯' },
                { key: 'showWishlist', label: '❤️ Wishlist Feature', icon: '❤️' },
                { key: 'showCart', label: '🛒 Shopping Cart', icon: '🛒' },
                { key: 'showReviews', label: '📊 Customer Reviews', icon: '📊' },
                { key: 'showStickyCTA', label: '📱 Sticky CTA Bar (Mobile)', icon: '📱' },
                { key: 'showUrgencyBadges', label: '⚡ Urgency Badges (Limited Stock)', icon: '⚡' },
                { key: 'showDiscountBadges', label: '🏷️ Discount Badges', icon: '🏷️' },
                { key: 'showRatings', label: '⭐ Product Ratings', icon: '⭐' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <span>{label}</span>
                  <button
                    onClick={() => handleToggle(key as keyof typeof settings)}
                    className={`px-4 py-2 rounded transition-all ${
                      settings[key as keyof typeof settings]
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {settings[key as keyof typeof settings] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl mb-6">💬 Manage Testimonials / Reviews</h2>

          {/* Add New Testimonial */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add New Testimonial
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Company/Organization</label>
                <input
                  type="text"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="ABC Corp"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-2">Testimonial Text *</label>
                <textarea
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  rows={3}
                  placeholder="Great service and quality products..."
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Rating</label>
                <select
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                  <option value={3}>⭐⭐⭐ (3 stars)</option>
                  <option value={2}>⭐⭐ (2 stars)</option>
                  <option value={1}>⭐ (1 star)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddTestimonial}
                  className="w-full bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Testimonial
                </button>
              </div>
            </div>
          </div>

          {/* Existing Testimonials */}
          <div className="space-y-4">
            <h3 className="text-xl mb-4">Existing Testimonials ({testimonials.length})</h3>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`border rounded-lg p-4 ${
                  testimonial.enabled ? 'bg-white' : 'bg-gray-100 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTestimonial(testimonial.id)}
                      className={`p-2 rounded ${
                        testimonial.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                      }`}
                      title={testimonial.enabled ? 'Hide' : 'Show'}
                    >
                      {testimonial.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-lg mt-8">
          <h2 className="text-2xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate('/services')}
              className="bg-white text-orange-500 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Preview Website
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all settings to default?')) {
                  localStorage.removeItem('skay-admin-settings');
                  localStorage.removeItem('skay-admin-testimonials');
                  window.location.reload();
                }
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors"
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
