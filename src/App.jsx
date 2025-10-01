// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";

// Base API : même logique que le login (fallback OptiAdmin en prod Vercel)
const API_BASE =
  (import.meta.env?.VITE_API_AUTH_BASE?.trim().replace(/\/$/, "")) ||
  (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")
    ? "https://opti-admin.vercel.app/api/site-ove"
    : "/api/site-ove");

function RequireAuth({ children }) {
  const loc = useLocation();
  const [allowed, setAllowed] = useState(null); // null = chargement

  useEffect(() => {
    let cancelled = false;

    const token =
      localStorage.getItem("OVE_JWT") ||
      sessionStorage.getItem("OVE_JWT") ||
      localStorage.getItem("ove_jwt") ||
      sessionStorage.getItem("ove_jwt") ||
      "";

    // ✅ Fallback optimiste : si on a un token local on laisse entrer,
    // la vérification /me arrivera en arrière-plan.
    if (token && !cancelled) setAllowed(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (cancelled) return;

        if (res.ok) {
          setAllowed(true);
        } else {
          // Pas de token ET /me échoue => on bloque
          if (!token) setAllowed(false);
          // Sinon (token présent mais /me ko), on laisse allowed tel quel (optimiste)
        }
      } catch {
        if (!token && !cancelled) setAllowed(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) return <div style={{ padding: 24 }}>Chargement…</div>;

  if (!allowed) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OVELanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/compte"
          element={
            <RequireAuth>
              <AccountClientPortal apiBase={API_BASE} />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
