import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Upload, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { api } from "../api/api";

export function Quote() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    serviceType: "",
    color: "",
    size: "",
    quantity: "",
    description: "",
  });

  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    "T-Shirt (Oversized)",
    "T-Shirt (Normal Fit)",
    "Hoodie",
    "Cap",
    "School Uniform",
    "Embroidery Work",
    "Coffee Mug",
    "Magic Mug",
    "Water Bottle",
    "Keychain",
    "Photo Frame",
    "Pillow",
    "Corporate Gifting Kit",
    "Branding Materials",
    "Document Printing",
    "Marketing Materials",
    "Visiting Cards",
    "Other (Specify in description)",
  ];

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
      name: "",
      company: "",
      phone: "",
      email: "",
      serviceType: "",
      color: "",
      size: "",
      quantity: "",
      description: "",
    });
    setFileName("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      productType: formData.serviceType,
      quantity: formData.quantity,
      description: `
        ${formData.company ? `Company: ${formData.company}` : ""}
        ${formData.color ? `Color: ${formData.color}` : ""}
        ${formData.size ? `Size: ${formData.size}` : ""}
        ${formData.description || ""}
      `.trim(),
    };

    try {
      const response = await api.services.submitQuote(payload);
      if (response?.success) {
        setSubmitted(true);
        resetForm();
      } else {
        throw new Error(response?.message || "Failed to submit quote");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit quote";
      if (message.includes("Inquiry saved")) {
        setSubmitted(true);
      } else {
        setError(message);
      }
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

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Header />

      <section className="bg-[#edeae5] border-b border-[#d9d6d1]">
        <div className="max-w-3xl mx-auto px-4 py-7">
          <h1 className="text-[46px] leading-none tracking-[-0.02em] text-[#222] md:text-[54px]">Get a Quote</h1>
          <p className="mt-4 text-[32px] leading-[1.15] font-semibold text-[#303030] md:text-[38px]">
            Tell us your
            <br />
            requirements
          </p>
          <p className="mt-4 text-[18px] leading-7 text-[#6b6b6b] max-w-[34rem]">
            Fill out the form below with your project details and we&apos;ll get back to you with a custom quote within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="max-w-3xl mx-auto px-3 md:px-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {submitted && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18} /> Quote request submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-[#e4e4e4] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-5 md:p-6">
              <h2 className="text-[34px] md:text-[38px] font-semibold text-[#333] tracking-[-0.01em] mb-4">Client Details</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Company / Organization Name</label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company name (optional)"
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#f0cf9f] bg-[#fdf9f3] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-5 md:p-6">
              <h2 className="text-[34px] md:text-[38px] font-semibold text-[#333] tracking-[-0.01em] mb-4">Order Details</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Service Type <span className="text-red-500">*</span></label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
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
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Color <span className="text-red-500">*</span></label>
                  <input
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Navy Blue"
                    className="w-full h-12 rounded-lg border border-[#e2b36a] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Size / Dimensions <span className="text-red-500">*</span></label>
                  <input
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., XL or Custom"
                    className="w-full h-12 rounded-lg border border-[#e2b36a] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Quantity <span className="text-red-500">*</span></label>
                  <input
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="w-full h-12 rounded-lg border border-[#ddd] bg-white px-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Detailed Description &amp; Special Instructions</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder={"Please provide specific details about your order:\n- Logo placement (e.g., left chest, back center)\n- Design specifications\n- Deadline requirements"}
                    className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-3 text-[15px] text-[#222] outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-[14px] text-[#4b4b4b] mb-1.5">Upload Design / Logo</label>
                  <label className="block cursor-pointer rounded-lg border border-dashed border-[#d6d6d6] bg-white px-3 py-3">
                    <div className="flex items-center justify-center gap-2 text-[#6d6d6d] text-[15px]">
                      <Upload size={16} />
                      <span className="text-center">{fileName || "Click to upload file (JPG, PNG, PDF, AI, PSD)"}</span>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <p className="mt-1 text-[12px] text-[#8b8b8b]">Max file size: 10MB. Supported formats: JPG, PNG, PDF, AI, PSD</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="mx-auto block w-full max-w-[340px] h-[58px] rounded-xl bg-[#d4d8de] text-[28px] font-medium text-[#6b7280] disabled:opacity-100"
            >
              {loading ? "Submitting..." : "Request Quote"}
            </button>

            {!isFormValid && (
              <p className="text-center text-[15px] text-[#ef4444]">Please fill in all required fields (marked with *)</p>
            )}

            <div className="rounded-xl border border-[#cfe2fb] bg-[#eaf3ff] px-5 py-5">
              <h3 className="text-[34px] font-semibold text-[#1f2937] mb-3">What happens next?</h3>
              <ul className="space-y-2.5 text-[28px] text-[#1f2937] leading-[1.35]">
                <li className="flex gap-2.5"><CheckCircle2 className="text-[#4f95f7] mt-1" size={20} />Our team reviews your requirements within 24 hours</li>
                <li className="flex gap-2.5"><CheckCircle2 className="text-[#4f95f7] mt-1" size={20} />You receive a detailed quote with pricing and timeline</li>
                <li className="flex gap-2.5"><CheckCircle2 className="text-[#4f95f7] mt-1" size={20} />We discuss any modifications and finalize the order</li>
                <li className="flex gap-2.5"><CheckCircle2 className="text-[#4f95f7] mt-1" size={20} />Production begins after your approval</li>
              </ul>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
