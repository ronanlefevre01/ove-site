import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Base API:
// - en dev sans proxy, mets VITE_API_BASE="https://opti-admin.vercel.app/api/site-ove"
// - avec proxy Vite, laisse vide et on utilisera "/api/site-ove"
const RUNTIME_API_BASE =
  (import.meta?.env?.VITE_API_BASE || "").toString().replace(/\/$/, "") || "/api/site-ove";

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");

    try {
      // 1) LOGIN
      const res = await fetch(`${RUNTIME_API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // indispensable pour le cookie HttpOnly
        body: JSON.stringify({ email, password }),
      });

      // Certaines erreurs renvoient de l'HTML -> parse sécurisé
      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 404 ? "endpoint_introuvable" : res.status === 401 ? "invalid_credentials" : "login_failed");
        throw new Error(msg);
      }

      // 2) Fallback dev : token renvoyé => on le garde (utile si cookie cross-site non posé en local)
      if (data?.token) {
        try {
          localStorage.setItem("OVE_JWT", data.token);
          sessionStorage.setItem("OVE_JWT", data.token);
          localStorage.setItem("ove_jwt", data.token);
          sessionStorage.setItem("ove_jwt", data.token);
        } catch {}
      }

      // 3) Vérifie la session (/me) avant de bouger
      const me = await fetch(`${RUNTIME_API_BASE}/auth/me`, {
        credentials: "include",
        headers: data?.token ? { Authorization: `Bearer ${data.token}` } : undefined,
      });

      if (!me.ok) throw new Error("session_non_etablie");

      // 4) OK -> redirection
      navigate(next, { replace: true });
    } catch (e) {
      const message = String(e?.message || "");
      // Harmonise certains messages
      if (message.includes("Failed to fetch")) setErr("endpoint_introuvable");
      else setErr(message || "Erreur de connexion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: 360, display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Connexion</h1>
        <p style={{ color: "#667085", marginTop: -6 }}>Accédez à votre espace client.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
          required
        />

        {err && <div style={{ color: "#b91c1c", fontSize: 14 }}>{err}</div>}

        <button disabled={busy} type="submit" style={primaryBtn}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

const input = { padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 10 };
const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "none",
  background: "#0b5ed7",
  color: "#fff",
  cursor: "pointer",
};
