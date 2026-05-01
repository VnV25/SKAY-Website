import { createBrowserRouter } from "react-router-dom";

import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { ServicesDetailed } from "./pages/ServicesDetailed";
import { Quote } from "./pages/Quote";
import { Gallery } from "./pages/Gallery";
import { Contact } from "./pages/Contact";
import { CustomerAuth } from "./pages/CustomerAuth";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminProducts } from "./pages/AdminProducts";
import { Wishlist } from "./pages/Wishlist";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { NotFound } from "./pages/NotFound";

import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/services",
    Component: Services,
  },
  {
    path: "/services/detailed",
    Component: ServicesDetailed,
  },
  {
    path: "/quote",
    Component: Quote,
  },
  {
    path: "/gallery",
    Component: Gallery,
  },
  {
    path: "/contact",
    Component: Contact,
  },
  {
    path: "/payment-success",
    Component: PaymentSuccess,
  },
  {
    path: "/auth",
    Component: CustomerAuth,
  },
  {
    path: "/login",
    Component: CustomerAuth,
  },
  {
    path: "/wishlist",
    Component: Wishlist,
  },

  {
    path: "/admin",
    Component: AdminLogin,
  },

  {
    path: "/admin/dashboard",
    Component: () => (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ),
  },

  {
    path: "/admin/settings",
    Component: () => (
      <AdminProtectedRoute>
        <AdminSettings />
      </AdminProtectedRoute>
    ),
  },

  {
    path: "/admin/products",
    Component: () => (
      <AdminProtectedRoute>
        <AdminProducts />
      </AdminProtectedRoute>
    ),
  },

  {
    path: "*",
    Component: NotFound,
  },
]);
