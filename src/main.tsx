// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import OVELanding from "./OVELanding";
import CatalogueMontures from "./pages/CatalogueMontures";

// Auth / Panier / Routes protégées
import { AuthProvider } from "@/auth/AuthContext";
import { CartProvider } from "@/cart/CartContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Pages membres
import Login from "@/pages/Login";
import Cart from "@/pages/Cart";
import OrderConfirm from "@/pages/OrderConfirm";

// Nouveau : portail compte B2B
import AccountClientPortal from "@/components/AccountClientPortal";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<OVELanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalogue/montures" element={<CatalogueMontures />} />

            {/* Protégé */}
            <Route element={<ProtectedRoute />}>
              {/* /compte → nouveau portail client */}
              <Route
                path="/compte"
                element={
                  <AccountClientPortal
                    apiBase={import.meta.env.VITE_API_BASE || "/api"}
                  />
                }
              />
              <Route path="/panier" element={<Cart />} />
              <Route path="/commande" element={<OrderConfirm />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<OVELanding />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
