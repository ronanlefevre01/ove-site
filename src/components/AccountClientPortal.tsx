// src/components/AccountClientPortal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

/* ===================== Types ===================== */
type Order = {
  id: string;
  number: string;
  status: "pending" | "confirmed" | "in_progress" | "shipped" | "delivered" | "cancelled" | string;
  total_cents: number;
  created_at: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: "open" | "waiting" | "closed" | string;
  order_id?: string | null;
  created_at: string;
};

type Product = {
  id: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  price_cents: number;
  category?: string | null;
  image_url?: string | null;
};

type CartItem = {
  name: string;
  sku?: string;
  qty: number;
  unitPriceCents: number;
  options?: Record<string, unknown>;
};

type Tab = "dashboard" | "catalog" | "new" | "orders" | "sav";

/* ===================== Helpers ===================== */
function getToken(): string {
  return (
    localStorage.getItem("OVE_JWT") ||
    sessionStorage.getItem("OVE_JWT") ||
    localStorage.getItem("ove_jwt") ||
    sessionStorage.getItem("ove_jwt") ||
    ""
  );
}

async function apiFetch<T>(
  url: string,
  opts: RequestInit = {},
  base = "/api"
): Promise<T> {
  const token = getToken();
  const extraHeaders: Record<string, string> =
    (opts.headers as Record<string, string>) || {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${url}`, {
    ...opts,
    headers,
    credentials: "include",
  });

  // 401 → retour login (évite boucle si déjà dessus)
  if (res.status === 401) {
    const here = `${typeof window !== "undefined" ? window.location.pathname : ""}${
      typeof window !== "undefined" ? window.location.search : ""
    }`;
    if (!here.startsWith("/login")) {
      const next = encodeURIComponent(here || "/");
      if (typeof window !== "undefined") {
        window.location.href = `/login?next=${next}`;
      }
    }
    throw new Error("401 unauthorized");
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} - ${detail}`);
  }

  return (await res.json()) as T;
}

function centsToEUR(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((cents || 0) / 100);
}

/* ===================== Component ===================== */
export default function AccountClientPortal({ apiBase = API_BASE }: { apiBase?: string }) {
  const navigate = useNavigate();
  const BASE = (apiBase || "/api").replace(/\/$/, ""); // normalisation

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Catalogue — filtres
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");

  // Nouvelle commande (panier)
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [shippingCents, setShippingCents] = useState(900);

  // Ticket SAV
  const [savSubject, setSavSubject] = useState("");
  const [savMessage, setSavMessage] = useState("");
  const [savOrderId, setSavOrderId] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (it.unitPriceCents || 0) * (it.qty || 0), 0),
    [items]
  );
  const total = useMemo(() => subtotal + (shippingCents || 0), [subtotal, shippingCents]);

  // Déconnexion
  async function handleLogout() {
    try {
      await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    try {
      localStorage.removeItem("OVE_JWT");
      localStorage.removeItem("ove_jwt");
      sessionStorage.removeItem("OVE_JWT");
      sessionStorage.removeItem("ove_jwt");
    } catch {}
    navigate("/login");
  }

  // Charge commandes + tickets au mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [o, t] = await Promise.all([
          apiFetch<{ page: number; pageSize: number; items: Order[] }>("/orders", {}, BASE),
          apiFetch<{ page: number; pageSize: number; total: number; items: Ticket[] }>("/tickets", {}, BASE),
        ]);
        if (!cancelled) {
          setOrders(o.items || []);
          setTickets(t.items || []);
        }
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message || "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [BASE]);

  // Charge catalogue (à l'ouverture de l'onglet ou quand q/category change)
  useEffect(() => {
    if (activeTab !== "catalog") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const url = `/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`;
        const resp = await apiFetch<{ page: number; pageSize: number; total: number; items: Product[] }>(
          url,
          {},
          BASE
        );
        if (!cancelled) setProducts(resp.items || []);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message || "Erreur catalogue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, q, category, BASE]);

  // Handlers — commandes & tickets
  async function handleCreateOrder() {
    try {
      setLoading(true);
      setError(null);
      const body = { items, notes, shippingCents };
      await apiFetch("/orders", { method: "POST", body: JSON.stringify(body) }, BASE);
      const o = await apiFetch<{ page: number; pageSize: number; items: Order[] }>("/orders", {}, BASE);
      setOrders(o.items || []);
      setActiveTab("orders");
      setNotes("");
      setItems([]);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket() {
    try {
      setLoading(true);
      setError(null);
      const body = { orderId: savOrderId || undefined, subject: savSubject, message: savMessage };
      await apiFetch("/tickets", { method: "POST", body: JSON.stringify(body) }, BASE);
      const t = await apiFetch<{ page: number; pageSize: number; items: Ticket[] }>("/tickets", {}, BASE);
      setTickets(t.items || []);
      setActiveTab("sav");
      setSavSubject("");
      setSavMessage("");
      setSavOrderId(null);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Erreur lors de la création du ticket");
    } finally {
      setLoading(false);
    }
  }

  // UI helpers
  function TabButton({ id, label }: { id: Tab; label: string }) {
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`px-3 py-2 rounded-xl text-sm font-medium mr-2 mb-2 border border-[var(--ove-border)] ${
          activeTab === id
            ? "bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
            : "bg-[var(--ove-surface)] text-[var(--ove-text)] hover:bg-[var(--ove-card)]"
        }`}
      >
        {label}
      </button>
    );
  }

  function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
    return (
      <div className={`rounded-2xl p-4 bg-[var(--ove-surface)] border border-[var(--ove-border)] ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] text-[var(--ove-text)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header + Déconnexion */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Mon espace</h1>
            <p className="opacity-80">Bienvenue dans votre portail client.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-[var(--ove-card)] hover:bg-[var(--ove-surface)] border border-[var(--ove-border)]"
            title="Se déconnecter"
          >
            Se déconnecter
          </button>
        </div>

        {/* Onglets */}
        <div className="mb-6 flex flex-wrap">
          <TabButton id="dashboard" label="Dashboard" />
          <TabButton id="catalog" label="Catalogue" />
          <TabButton id="new" label="Nouvelle commande" />
          <TabButton id="orders" label="Mes commandes" />
          <TabButton id="sav" label="SAV" />
        </div>

        {error && (
          <div className="bg-[var(--ove-danger)]/20 border border-[var(--ove-danger)] text-[var(--ove-text)] rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="text-sm opacity-80">Commandes</div>
                <div className="text-2xl font-semibold">{orders.length}</div>
              </Card>
              <Card>
                <div className="text-sm opacity-80">Tickets SAV</div>
                <div className="text-2xl font-semibold">{tickets.length}</div>
              </Card>
              <Card>
                <div className="text-sm opacity-80">Montant total (approx.)</div>
                <div className="text-2xl font-semibold">
                  {centsToEUR(orders.reduce((acc, o) => acc + (o.total_cents || 0), 0))}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* CATALOGUE */}
        {activeTab === "catalog" && (
          <section className="space-y-4">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm mb-1 opacity-80">Recherche</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Nom, référence…"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 opacity-80">Catégorie</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="(ex: Montures, Solaires…)"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab("new")}
                    className="px-4 py-2 rounded-xl bg-[var(--ove-accent)] text-[var(--ove-accent-contrast)] hover:opacity-90"
                  >
                    Aller au panier ({items.length})
                  </button>
                  <button
                    onClick={() => {
                      setQ("");
                      setCategory("");
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--ove-card)] hover:bg-[var(--ove-surface)]"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden border border-[var(--ove-border)] bg-[var(--ove-surface)]"
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-[var(--ove-card)]" />
                  )}
                  <div className="p-3">
                    <div className="text-sm opacity-80">{p.sku}</div>
                    <div className="font-semibold mb-1">{p.name}</div>
                    <div className="text-sm opacity-80 mb-2">{p.category || ""}</div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{centsToEUR(p.price_cents)}</div>
                      <button
                        className="px-3 py-1 rounded-lg bg-[var(--ove-accent)] text-[var(--ove-accent-contrast)] hover:opacity-90"
                        onClick={() =>
                          setItems((old) => {
                            const idx = old.findIndex(
                              (it) => it.sku === p.sku && it.unitPriceCents === p.price_cents
                            );
                            if (idx >= 0) {
                              const n = [...old];
                              n[idx] = { ...n[idx], qty: n[idx].qty + 1 };
                              return n;
                            }
                            return [
                              ...old,
                              { name: p.name, sku: p.sku || undefined, qty: 1, unitPriceCents: p.price_cents },
                            ];
                          })
                        }
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="col-span-full opacity-80">Aucun produit pour ces critères.</div>}
            </div>
          </section>
        )}

        {/* NOUVELLE COMMANDE */}
        {activeTab === "new" && (
          <section className="space-y-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">Panier</h2>
                <button
                  className="px-3 py-2 rounded-xl bg-[var(--ove-card)] hover:bg-[var(--ove-surface)]"
                  onClick={() => setActiveTab("catalog")}
                >
                  + Depuis le catalogue
                </button>
              </div>
              {items.length === 0 ? (
                <div className="opacity-80 mt-2">Aucun article. Ajoute des produits depuis l’onglet Catalogue.</div>
              ) : (
                <div className="mt-3">
                  {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                      <input
                        className="col-span-4 px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                        value={it.name}
                        onChange={(e) => {
                          const v = e.target.value;
                          const n = [...items];
                          n[i].name = v;
                          setItems(n);
                        }}
                        placeholder="Nom article"
                      />
                      <input
                        className="col-span-2 px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                        value={it.sku || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          const n = [...items];
                          (n[i] as CartItem).sku = v;
                          setItems(n);
                        }}
                        placeholder="Référence"
                      />
                      <input
                        type="number"
                        className="col-span-2 px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                        value={it.qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10);
                          const n = [...items];
                          n[i].qty = v;
                          setItems(n);
                        }}
                        placeholder="Qté"
                      />
                      <input
                        type="number"
                        className="col-span-3 px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                        value={it.unitPriceCents}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10);
                          const n = [...items];
                          n[i].unitPriceCents = v;
                          setItems(n);
                        }}
                        placeholder="Prix unitaire (cents)"
                      />
                      <button
                        className="col-span-1 px-3 py-2 rounded-lg bg-[var(--ove-danger)]/80 hover:bg-[var(--ove-danger)]"
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <label className="block text-sm mb-1 opacity-80">Frais de port (cents)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                  value={shippingCents}
                  onChange={(e) => setShippingCents(parseInt(e.target.value || "0", 10))}
                />
              </Card>
              <Card>
                <div className="text-sm opacity-80">Sous-total</div>
                <div className="text-xl font-semibold">{centsToEUR(subtotal)}</div>
              </Card>
              <Card>
                <div className="text-sm opacity-80">Total</div>
                <div className="text-xl font-semibold">{centsToEUR(total)}</div>
              </Card>
            </div>

            <Card>
              <label className="block text-sm mb-1 opacity-80">Notes</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>

            <div className="flex gap-3">
              <button
                disabled={loading || items.length === 0}
                onClick={handleCreateOrder}
                className="px-4 py-2 rounded-xl bg-[var(--ove-success)] hover:opacity-90 disabled:opacity-50"
              >
                Créer la commande
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className="px-4 py-2 rounded-xl bg-[var(--ove-card)] hover:bg-[var(--ove-surface)]"
              >
                Voir mes commandes
              </button>
            </div>
          </section>
        )}

        {/* MES COMMANDES */}
        {activeTab === "orders" && (
          <section className="space-y-4">
            <Card>
              <h2 className="text-xl font-semibold mb-3">Mes commandes</h2>
              {orders.length === 0 ? (
                <div className="opacity-80">Aucune commande pour l’instant.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="opacity-70">
                      <tr>
                        <th className="py-2 pr-4">Numéro</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-t border-[var(--ove-border)]">
                          <td className="py-2 pr-4 font-medium">{o.number}</td>
                          <td className="py-2 pr-4">{new Date(o.created_at).toLocaleString()}</td>
                          <td className="py-2 pr-4">
                            <span className="px-2 py-1 rounded-lg bg-[var(--ove-card)]">{o.status}</span>
                          </td>
                          <td className="py-2 pr-4">{centsToEUR(o.total_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* SAV */}
        {activeTab === "sav" && (
          <section className="space-y-4">
            <Card>
              <h2 className="text-xl font-semibold mb-3">Ouvrir un ticket SAV</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1 opacity-80">Commande (optionnel)</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                    value={savOrderId || ""}
                    onChange={(e) => setSavOrderId(e.target.value || null)}
                  >
                    <option value="">— Aucune —</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.number}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 opacity-80">Sujet</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                    value={savSubject}
                    onChange={(e) => setSavSubject(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm mb-1 opacity-80">Message</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-[var(--ove-text)] text-[var(--ove-accent-contrast)]"
                  rows={4}
                  value={savMessage}
                  onChange={(e) => setSavMessage(e.target.value)}
                />
              </div>
              <div className="mt-3">
                <button
                  disabled={loading || !savSubject || !savMessage}
                  onClick={handleCreateTicket}
                  className="px-4 py-2 rounded-xl bg-[var(--ove-accent)] text-[var(--ove-accent-contrast)] hover:opacity-90 disabled:opacity-50"
                >
                  Envoyer le ticket
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-3">Mes tickets</h2>
              {tickets.length === 0 ? (
                <div className="opacity-80">Aucun ticket pour l’instant.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="opacity-70">
                      <tr>
                        <th className="py-2 pr-4">Sujet</th>
                        <th className="py-2 pr-4">Statut</th>
                        <th className="py-2 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id} className="border-t border-[var(--ove-border)]">
                          <td className="py-2 pr-4">{t.subject}</td>
                          <td className="py-2 pr-4">
                            <span className="px-2 py-1 rounded-lg bg-[var(--ove-card)]">{t.status}</span>
                          </td>
                          <td className="py-2 pr-4">{new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        )}

        {loading && (
          <div className="fixed bottom-4 right-4 px-3 py-2 rounded-xl bg-[var(--ove-card)] backdrop-blur">
            Chargement…
          </div>
        )}
      </div>
    </div>
  );
}
