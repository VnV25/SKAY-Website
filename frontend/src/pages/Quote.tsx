import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/api';
import { serviceCategories } from '../data/services';
import { useAdmin } from '../context/AdminContext';

export function Quote() {
  const { products } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    serviceType: '',
    color: '',
    variant: '',
    size: '',
    quantity: '',
    description: '',
  });

  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const serviceTypes = Array.from(
    new Set([
      ...products.map((product) => product.name),
      ...serviceCategories.flatMap((category) => category.items.map((item) => item.name)),
      'Other (Specify in description)',
    ])
  ).sort((a, b) => a.localeCompare(b));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      serviceType: '',
      color: '',
      variant: '',
      size: '',
      quantity: '',
      description: '',
    });
    setFileName('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      serviceType: formData.serviceType,
      color: formData.color,
      variant: formData.variant,
      size: formData.size,
      quantity: formData.quantity,
      description: [
        formData.company ? `Company: ${formData.company}` : '',
        formData.color ? `Color: ${formData.color}` : '',
        formData.variant ? `Variant: ${formData.variant}` : '',
        formData.size ? `Size: ${formData.size}` : '',
        formData.description,
      ]
        .filter(Boolean)
        .join('\n'),
    };

    try {
      const response = await api.services.submitQuote(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to submit quote');
      }

      setSubmitted(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.phone &&
    formData.email &&
    formData.serviceType &&
    formData.color &&
    formData.size &&
    formData.quantity;

  /* Shared input classes */
  const inputClass =
    'w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Get a Quote
          </h1>
          <p className="mt-4 text-3xl md:text-4xl font-semibold text-white leading-snug">
            Tell us your
            <br />
            requirements
          </p>
          <p className="mt-4 text-lg text-white/60 max-w-lg leading-relaxed">
            Fill out the form below with your project details and we'll get back to you with a custom quote within 24 hours.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 md:py-12">
        <div className="max-w-3xl mx-auto px-4">

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
              <CheckCircle2 size={18} />
              Quote request submitted successfully. We'll be in touch within 24 hours.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Client Details Card */}
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-lg shadow-xl p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-tight mb-6">
                Client Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Company / Organization Name
                  </label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name (optional)"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Phone Number <span className="text-pink-400">*</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXXXXXXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Email Address <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="rounded-2xl border border-purple-400/20 bg-white/10 backdrop-blur-lg shadow-xl p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight mb-6">
                Order Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Service Type <span className="text-pink-400">*</span>
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 [&>option]:bg-indigo-950 [&>option]:text-white"
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Color <span className="text-pink-400">*</span>
                  </label>
                  <input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Navy Blue"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Variant / Style
                  </label>
                  <input
                    name="variant"
                    value={formData.variant}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Sleeve, Half Sleeve, Zipper"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Size / Dimensions <span className="text-pink-400">*</span>
                  </label>
                  <input
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., XL or Custom"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Quantity <span className="text-pink-400">*</span>
                  </label>
                  <input
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Detailed Description &amp; Special Instructions
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder={'Please provide specific details about your order:\n- Logo placement\n- Design specifications\n- Deadline requirements'}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Upload Design / Logo
                  </label>
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-4 hover:bg-white/10 hover:border-pink-400/50 transition-all duration-200">
                    <div className="flex items-center justify-center gap-2 text-white/50 hover:text-white/70 text-sm">
                      <Upload size={16} className="text-pink-400" />
                      <span>{fileName || 'Click to upload file (JPG, PNG, PDF, AI, PSD)'}</span>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <p className="mt-1.5 text-xs text-white/40">Max file size: 10MB. Supported formats: JPG, PNG, PDF, AI, PSD</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full max-w-sm h-14 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isFormValid && !loading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-[1.02] hover:brightness-110 shadow-lg shadow-pink-500/30'
                    : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'
                }`}
              >
                {loading ? 'Submitting...' : 'Request Quote'}
              </button>

              {!isFormValid && (
                <p className="text-sm text-pink-400/80">Please fill in all required fields (marked with *)</p>
              )}
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
