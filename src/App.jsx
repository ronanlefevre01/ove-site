// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";

const ABSOLUTE_FALLBACK = "https://opti-admin.vercel.app/api/site-ove";
const API_BASE =
  import.meta.env?.VITE_API_AUTH_BASE ||
  (location.hostname.endsWith("vercel.app") ? ABSOLUTE_FALLBACK : "/api/site-ove");

function RequireAuth({ children }) {
  const loc = useLocation();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let cancel = false;
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
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!cancel) setAllowed(res.ok);
      } catch {
        if (!cancel) setAllowed(false);
      }
    })();
    return () => { cancel = true; };
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
