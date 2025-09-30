// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";

// Même nom d'ENV que sur la page login
// - en dev sans proxy: VITE_API_BASE="https://opti-admin.vercel.app/api/site-ove"
// - en prod (sur le même domaine): fallback "/api/site-ove"
const API_BASE = (import.meta?.env?.VITE_API_BASE || "/api/site-ove").replace(/\/$/, "");

function RequireAuth({ children }) {
  const loc = useLocation();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const token =
          localStorage.getItem("OVE_JWT") ||
          sessionStorage.getItem("OVE_JWT") ||
          localStorage.getItem("ove_jwt") ||
          sessionStorage.getItem("ove_jwt") ||
          "";

        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: ctrl.signal,
        });

        if (!cancelled) setAllowed(res.ok);
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [API_BASE]); // dépend de la base API

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
              {/* La même base API que celle utilisée pour /auth */}
              <AccountClientPortal apiBase={API_BASE} />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
