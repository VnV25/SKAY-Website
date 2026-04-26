import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';

import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-lg font-semibold">Loading...</h2>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <ShopProvider>
          <AppContent />
        </ShopProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;
