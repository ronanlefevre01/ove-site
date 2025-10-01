// src/config.ts
export const API_BASE =
  (import.meta.env?.VITE_API_AUTH_BASE?.trim().replace(/\/$/, "")) ||
  (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")
    ? "https://opti-admin.vercel.app/api/site-ove"
    : "/api/site-ove");
