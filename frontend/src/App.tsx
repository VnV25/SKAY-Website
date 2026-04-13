import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';

// Main App Component - Using react-router (not react-router-dom)
function App() {
  return (
    <AdminProvider>
      <ShopProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ShopProvider>
    </AdminProvider>
  );
}

export default App;
