import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 md:py-24 min-h-[60vh] flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-9xl mb-6 text-orange-500">404</div>
          <h1 className="text-4xl mb-4">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
            >
              <Home size={20} />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-md hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
