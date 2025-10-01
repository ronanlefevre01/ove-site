import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";
import { API_BASE } from "./config";

function RequireAuth({ children }) {
  const loc = useLocation();
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) s’il y a un token local, on autorise *tout de suite* (optimiste)
        const token =
          localStorage.getItem("OVE_JWT") ||
          sessionStorage.getItem("OVE_JWT") ||
          "";

        if (token) {
          if (!cancelled) setAllowed(true);
          return;
        }

        // 2) sinon on vérifie la session côté API (cookie cross-site)
        const me = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!cancelled) setAllowed(me.ok);
      } catch {
        if (!cancelled) setAllowed(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (allowed === null) return <div style={{ padding: 24 }}>Chargement…</div>;

  if (!allowed) {
    // Soft redirect via React Router
    const to = `/login?next=${encodeURIComponent(loc.pathname + loc.search)}`;
    // Fallback hard redirect si jamais Navigate ne s’applique pas (rare mais vu chez toi)
    if (typeof window !== "undefined") {
      window.location.replace(to);
      return null;
    }
    return <Navigate to={to} replace />;
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
