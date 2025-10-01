// src/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { API_BASE } from "./config";

export default function RequireAuth({ children }) {
  const loc = useLocation();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        const token =
          localStorage.getItem("OVE_JWT") ||
          sessionStorage.getItem("OVE_JWT") ||
          "";

        const me = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!cancel) setAllowed(me.ok);
      } catch {
        if (!cancel) setAllowed(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [loc.key]); // re-vérifie quand on change de page

  if (allowed === null) return <div style={{ padding: 24 }}>Chargement…</div>;
  if (!allowed) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
