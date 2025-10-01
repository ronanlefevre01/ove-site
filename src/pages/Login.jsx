// src/pages/login.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE =
  (import.meta.env?.VITE_API_AUTH_BASE?.trim().replace(/\/$/, "")) ||
  (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")
    ? "https://opti-admin.vercel.app/api/site-ove"
    : "/api/site-ove");

const getToken = () =>
  localStorage.getItem("OVE_JWT") ||
  sessionStorage.getItem("OVE_JWT") ||
  localStorage.getItem("ove_jwt") ||
  sessionStorage.getItem("ove_jwt") ||
  "";

export default function LoginPage() {
  const [params] = useSearchParams();
  const rawNext = params.get("next") || "/compte";
  const next = /^\/[a-zA-Z0-9/_\-?=&.%]*$/.test(rawNext) ? rawNext : "/compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Si déjà loggé (token en storage), on saute directement au portail
  useEffect(() => {
    const t = getToken();
    if (t) {
      console.log("[login] token déjà présent -> redirect", next);
      window.location.replace(next);
    }
  }, [next]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");

    try {
      console.log("[login] POST", `${API_BASE}/auth/login`);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      console.log("[login] status:", res.status, "payload:", data);

      if (!res.ok) {
        throw new Error(data?.error || (res.status === 404 ? "endpoint_introuvable" : "invalid_credentials"));
      }

      if (data?.token) {
        try {
          localStorage.setItem("OVE_JWT", data.token);
          sessionStorage.setItem("OVE_JWT", data.token);
          console.log("[login] token sauvegardé");
        } catch {}
      }

      // 🔁 on n’attend pas /auth/me ici : on force le reload portail
      console.log("[login] redirect ->", next);
      window.location.replace(next);
    } catch (e) {
      console.error("[login] error:", e);
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
