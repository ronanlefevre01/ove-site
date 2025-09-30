export function getOveToken() {
  return (
    localStorage.getItem("OVE_JWT") ||
    sessionStorage.getItem("OVE_JWT") ||
    ""
  );
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getOveToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
