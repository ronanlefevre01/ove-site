// Détermine la base API une bonne fois pour toutes
export function getApiBase(): string {
  // 1) si var d'env présente, on l'utilise
  const envBase = import.meta.env?.VITE_API_AUTH_BASE?.trim().replace(/\/$/, "");
  if (envBase) return envBase;

  // 2) fallback auto en prod (Vercel) vers l'API OptiAdmin
  if (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")) {
    return "https://opti-admin.vercel.app/api/site-ove";
  }

  // 3) en local on garde le proxy /api
  return "/api/site-ove";
}

// Optionnel : petit helper pour récupérer le token fallback
export function getStoredToken(): string {
  try {
    return (
      localStorage.getItem("OVE_JWT") ||
      sessionStorage.getItem("OVE_JWT") ||
      ""
    );
  } catch {
    return "";
  }
}
