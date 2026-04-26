import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';

export function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center bg-green-50 border border-green-200 rounded-xl p-8">
          <h1 className="text-3xl font-semibold text-green-700">Payment Successful</h1>
          <p className="mt-3 text-gray-700">Thank you for your order. Your payment has been completed.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/services" className="bg-orange-500 text-white px-5 py-2.5 rounded-md hover:bg-orange-600">
              Continue Shopping
            </Link>
            <Link to="/" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-md hover:bg-gray-50">
              Go Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
