import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export function AdminSettings() {
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { settings, testimonials, updateSettings, updateAnnouncement, addTestimonial, deleteTestimonial, toggleTestimonial } = useAdmin();
  const [saved, setSaved] = useState(false);

  const [newTestimonial, setNewTestimonial] = useState({
    name: '', company: '', text: '', rating: 5, enabled: true,
  });

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="text-white/60 text-lg animate-pulse">Loading settings...</div>
      </div>
    );
  }

  /* Shared input class */
  const inputClass = 'w-full h-11 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200';
  const textareaClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 resize-none';
  const selectClass = 'w-full h-11 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 [&>option]:bg-indigo-950 [&>option]:text-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <Header mode="admin" />

      {/* Page header */}
      <section className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                Site Settings
              </h1>
              <p className="text-white/50 mt-1 text-sm">Manage all website features and content</p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-semibold">
                <Save size={16} /> Saved!
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Announcement Bar */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              📢 Announcement Bar
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-white/70 text-sm">Enable Announcement Bar</span>
                <button
                  onClick={() => handleAnnouncementUpdate('enabled', !settings.announcement.enabled)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    settings.announcement.enabled
                      ? 'bg-green-500/80 text-white border border-green-400/30'
                      : 'bg-white/10 text-white/50 border border-white/15'
                  }`}
                >
                  {settings.announcement.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Announcement Text</label>
                <textarea
                  value={settings.announcement.text}
                  onChange={(e) => handleAnnouncementUpdate('text', e.target.value)}
                  className={textareaClass}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Discount Code (Optional)</label>
                <input
                  type="text"
                  value={settings.announcement.discountCode || ''}
                  onChange={(e) => handleAnnouncementUpdate('discountCode', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., SKAY40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Background Style</label>
                <select
                  value={settings.announcement.backgroundColor}
                  onChange={(e) => handleAnnouncementUpdate('backgroundColor', e.target.value)}
                  className={selectClass}
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
          <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-5">🎛️ Feature Toggles</h2>
            <div className="space-y-2.5">
              {[
                { key: 'showTrending', label: '⭐ Trending Products Section' },
                { key: 'showBundles', label: '🎯 Combo/Bundle Deals' },
                { key: 'showWishlist', label: '❤️ Wishlist Feature' },
                { key: 'showCart', label: '🛒 Shopping Cart' },
                { key: 'showReviews', label: '📊 Customer Reviews' },
                { key: 'showStickyCTA', label: '📱 Sticky CTA Bar (Mobile)' },
                { key: 'showUrgencyBadges', label: '⚡ Urgency Badges (Limited Stock)' },
                { key: 'showDiscountBadges', label: '🏷️ Discount Badges' },
                { key: 'showRatings', label: '⭐ Product Ratings' },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/70 text-sm">{label}</span>
                  <button
                    onClick={() => handleToggle(key as keyof typeof settings)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      settings[key as keyof typeof settings]
                        ? 'bg-green-500/80 text-white border border-green-400/30'
                        : 'bg-white/10 text-white/50 border border-white/15'
                    }`}
                  >
                    {settings[key as keyof typeof settings] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-5">💬 Manage Testimonials</h2>

          {/* Add new */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-pink-400" /> Add New Testimonial
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Customer Name *</label>
                <input
                  type="text"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Company / Organization</label>
                <input
                  type="text"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  className={inputClass}
                  placeholder="ABC Corp"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Testimonial Text *</label>
                <textarea
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  className={textareaClass}
                  rows={3}
                  placeholder="Great service and quality products..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Rating</label>
                <select
                  value={newTestimonial.rating}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                  className={selectClass}
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
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
                >
                  <Plus size={18} /> Add Testimonial
                </button>
              </div>
            </div>
          </div>

          {/* Existing */}
          <h3 className="text-sm font-semibold text-white/60 mb-3">
            Existing Testimonials ({testimonials.length})
          </h3>
          <div className="space-y-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`border rounded-xl p-4 transition-all ${
                  testimonial.enabled
                    ? 'bg-white/5 border-white/15'
                    : 'bg-white/3 border-white/8 opacity-50'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-white/45 mt-0.5">{testimonial.company}</div>
                    <div className="text-yellow-400 text-xs mt-1">{'★'.repeat(testimonial.rating)}</div>
                    <p className="text-white/60 text-sm mt-2 leading-relaxed">"{testimonial.text}"</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleTestimonial(testimonial.id)}
                      className={`p-2 rounded-lg border transition-all ${
                        testimonial.enabled
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : 'bg-white/10 border-white/15 text-white/40'
                      }`}
                      title={testimonial.enabled ? 'Hide' : 'Show'}
                    >
                      {testimonial.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="p-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-lg border border-white/15 rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-bold text-white mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate('/services')}
              className="bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm"
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
              className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm"
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
