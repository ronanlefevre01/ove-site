// src/lib/apiBase.ts
/**
 * Base d'URL de l'API côté front (utilisée par Login, AuthGate, etc.)
 * - VITE_API_AUTH_BASE si défini (préprod/prod custom)
 * - sinon: en prod Vercel, fallback vers ton OptiAdmin
 * - sinon: en local, proxy /api/site-ove
 */
const envBase = (import.meta as any)?.env?.VITE_API_AUTH_BASE || "";

export const API_BASE = (envBase
  ? String(envBase)
  : (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")
      ? "https://opti-admin.vercel.app/api/site-ove"
      : "/api/site-ove")
).replace(/\/$/, "");
