import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function PaymentSuccess() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
              Payment Successful
            </h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              Thank you for your order. Your payment has been completed and we'll start processing it right away.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                to="/services"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:brightness-110 hover:scale-105 transition-all duration-300 font-semibold shadow-lg shadow-pink-500/25"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="border border-white/20 text-white/70 px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
