// src/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const loc = useLocation();

  // ✅ On n'appelle plus /auth/me ici.
  // Si un token est présent, on laisse entrer, sinon on renvoie vers /login.
  const token =
    localStorage.getItem("OVE_JWT") ||
    sessionStorage.getItem("OVE_JWT") ||
    "";

  if (!token) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
}
