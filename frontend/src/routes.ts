import { createBrowserRouter } from "react-router";
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
import { CustomizedMerchandise } from "./pages/CustomizedMerchandise";
import { NotFound } from "./pages/NotFound";

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
    path: "/customized-merchandise",
    Component: CustomizedMerchandise,
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
    Component: AdminDashboard,
  },
  {
    path: "/admin/settings",
    Component: AdminSettings,
  },
  {
    path: "/admin/products",
    Component: AdminProducts,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);