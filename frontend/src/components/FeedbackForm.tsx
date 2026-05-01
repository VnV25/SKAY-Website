import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import { api } from '../api/api';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) { setError('Please enter your name'); return; }
    if (!formData.email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email address'); return; }
    if (!formData.rating) { setError('Please select a rating'); return; }
    if (!formData.message.trim()) { setError('Please enter your message'); return; }

    setIsSubmitting(true);

    try {
      const response = await api.feedback.submit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rating: formData.rating,
        message: formData.message.trim(),
      });

      if (response && typeof response === 'object' && response.success === false) {
        throw new Error(response.message || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', rating: 0, message: '' });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200';

  if (isSubmitted) {
    return (
      <div className="bg-green-500/15 border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
        <p className="text-white/60 text-sm">Your feedback has been submitted successfully.</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-5 text-sm text-pink-400 hover:text-pink-300 transition-colors"
        >
          Submit another review
        </button>
      </div>
    );
  }

  const displayRating = hoveredRating || formData.rating;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-1">
          Share Your Feedback
        </h2>
        <p className="text-white/50 text-sm">Help us improve by sharing your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name + Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Email <span className="text-pink-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className={inputClass}
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2.5">
            Rating <span className="text-pink-400">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, rating: star }))}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={30}
                  className={`transition-colors duration-150 ${
                    star <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-white/20 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            {displayRating > 0 && (
              <span className="ml-2 text-sm font-semibold text-yellow-400">
                {RATING_LABELS[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Message <span className="text-pink-400">*</span>
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Tell us about your experience with SKAY..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold
            hover:brightness-110 hover:scale-[1.02] transition-all duration-300
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={17} />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
