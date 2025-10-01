import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/apiBase";

export default function LoginPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const rawNext = params.get("next") || "/compte";
  const next = /^\/[a-zA-Z0-9/_\-?=&.%]*$/.test(rawNext) ? rawNext : "/compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const txt = await r.text();
      const data = txt ? JSON.parse(txt) : {};
      if (!r.ok) throw new Error(data?.error || "login_failed");
      // (le cookie OVE_SESSION est posé par la réponse proxy)
      nav(next, { replace: true }); // navigation propre (pas de window.location)
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
        <input type="email" placeholder="Email" value={email}
               onChange={(e)=>setEmail(e.target.value)} required style={input}/>
        <input type="password" placeholder="Mot de passe" value={password}
               onChange={(e)=>setPassword(e.target.value)} required style={input}/>
        {err && <div style={{ color: "#b91c1c", fontSize: 14 }}>{err}</div>}
        <button disabled={busy} type="submit" style={btn}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
const input = { padding:"12px 14px", border:"1px solid #e5e7eb", borderRadius:10 };
const btn   = { padding:"12px 14px", borderRadius:10, border:"none", background:"#0b5ed7", color:"#fff", cursor:"pointer" };
