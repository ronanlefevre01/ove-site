import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { API_BASE } from "../lib/apiBase";

export default function AuthGate({ children }) {
  const [status, setStatus] = React.useState<"idle"|"ok"|"nope">("idle");
  const [user, setUser] = React.useState(null);
  const loc = useLocation();

  React.useEffect(() => {
    let done = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!done && r.ok) {
          const j = await r.json().catch(() => ({}));
          setUser(j?.user || null);
          setStatus("ok");
        } else if (!done) {
          setStatus("nope");
        }
      } catch {
        if (!done) setStatus("nope");
      }
    })();
    return () => { done = true; };
  }, [loc.key]); // un check à l’arrivée

  if (status === "idle") return null; // ou un mini spinner
  if (status === "nope") {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
