
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { AuthProvider } from "./context/AuthContext.tsx";
  import { ShopProvider } from "./context/ShopContext.tsx";
  import { AdminProvider } from "./context/AdminContext.tsx";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <AdminProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AdminProvider>
    </AuthProvider>
  );
  