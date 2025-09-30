import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Base API: lue depuis l'env, sinon on choisit un fallback selon l'hôte
const ABSOLUTE_FALLBACK =
  "https://opti-admin.vercel.app/api/site-ove";
const API_BASE =
  import.meta.env?.VITE_API_AUTH_BASE ||
  (location.hostname.endsWith("vercel.app") ? ABSOLUTE_FALLBACK : "/api/site-ove");

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

    const body = JSON.stringify({ email, password });

    // petite fonction util pour parser en sécurité (HTML, empty, JSON…)
    const safeParse = async (res) => {
      try {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      } catch {
        return {};
      }
    };

    try {
      // 1) essai avec API_BASE
      let res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body,
      });

      // 2) si 404 ET qu'on était en relatif, on retente en absolu
      if (res.status === 404 && API_BASE.startsWith("/")) {
        res = await fetch(`${ABSOLUTE_FALLBACK}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          credentials: "include",
          body,
        });
      }

      const data = await safeParse(res);
      if (!res.ok) {
        const msg = data?.error || (res.status === 404 ? "endpoint_introuvable" : "invalid_credentials");
        throw new Error(msg);
      }

      // token fallback (utile si le cookie cross-site est bloqué en dev)
      if (data?.token) {
        try {
          localStorage.setItem("OVE_JWT", data.token);
          sessionStorage.setItem("OVE_JWT", data.token);
        } catch {}
      }

      // sanity check de session
      const me = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
        headers: data?.token ? { Authorization: `Bearer ${data.token}` } : undefined,
      });
      if (!me.ok) throw new Error("session_non_etablie");

      navigate(next, { replace: true });
    } catch (e) {
      setErr(String(e?.message || "Erreur de connexion"));
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
