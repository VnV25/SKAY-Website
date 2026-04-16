import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Upload, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function Quote() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    serviceType: '',
    color: '',
    size: '',
    quantity: '',
    description: '',
  });

  const [fileName, setFileName] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const serviceTypes = [
    'T-Shirt (Oversized)',
    'T-Shirt (Normal Fit)',
    'Hoodie',
    'Cap',
    'School Uniform',
    'Embroidery Work',
    'Coffee Mug',
    'Magic Mug',
    'Water Bottle',
    'Keychain',
    'Photo Frame',
    'Pillow',
    'Corporate Gifting Kit',
    'Branding Materials',
    'Document Printing',
    'Marketing Materials',
    'Visiting Cards',
    'Other (Specify in description)',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        serviceType: '',
        color: '',
        size: '',
        quantity: '',
        description: '',
      });
      setFileName('');
    }, 3000);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.phone &&
      formData.email &&
      formData.serviceType &&
      formData.color &&
      formData.size &&
      formData.quantity
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl mb-4">Quote Request Submitted!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your inquiry. Our team will review your requirements and get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-500">
              Check your email for confirmation details.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">Get a Quote</h1>
            <p className="text-xl text-gray-600">
              Fill out the form below with your project details and we'll get back to you with a custom quote within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Details */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl mb-6">Client Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm mb-2">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Company name (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-orange-50 p-8 rounded-lg shadow-md border-2 border-orange-200">
              <h2 className="text-2xl mb-6">Order Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="serviceType" className="block text-sm mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="color" className="block text-sm mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      required
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g., Navy Blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="size" className="block text-sm mb-2">
                      Size / Dimensions <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      required
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g., XL or Custom"
                    />
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm mb-2">
                    Detailed Description & Special Instructions
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    placeholder="Please provide specific details about your order:&#10;- Logo placement (e.g., left chest, back center)&#10;- Design specifications&#10;- Deadline requirements&#10;- Any other special instructions"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Upload Design / Logo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file"
                      accept="image/*,.pdf,.ai,.psd"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-orange-500 transition-colors bg-white"
                    >
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-gray-600">
                        {fileName || 'Click to upload file (JPG, PNG, PDF, AI, PSD)'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 10MB. Supported formats: JPG, PNG, PDF, AI, PSD
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`px-12 py-4 rounded-md text-lg transition-all ${
                  isFormValid()
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Request Quote
              </button>
              {!isFormValid() && (
                <p className="text-sm text-red-500 mt-3">
                  Please fill in all required fields (marked with *)
                </p>
              )}
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg mb-3">What happens next?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Our team reviews your requirements within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>You receive a detailed quote with pricing and timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>We discuss any modifications and finalize the order</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Production begins after your approval</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
