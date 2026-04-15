import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';

// Main App Component - Using react-router (not react-router-dom)
function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <ShopProvider>
          <RouterProvider router={router} />
        </ShopProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;
