import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';

// Main App Component - Using react-router (not react-router-dom)
function App() {
  return (
    <AdminProvider>
      <ShopProvider>
        <RouterProvider router={router} />
      </ShopProvider>
    </AdminProvider>
  );
}

export default App;