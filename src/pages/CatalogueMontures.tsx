// src/pages/CatalogueMontures.tsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Auth & Panier
import { useAuth } from "@/auth/AuthContext";
import { useCart } from "@/cart/CartContext";

type Monture = {
  sku: string;
  brand: string;
  model: string;
  color: string;
  material?: string;
  shape?: string;
  price_ht?: number;
  stock?: number;
  image_url: string;
  color_code?: string; // C1, C2…
  gender?: string;     // "Homme" | "Femme" | autre
};

function toNumber(v: any): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(String(v).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Normalisation ultra tolérante */
function normalizeRow(row: any): Monture | null {
  if (!row || typeof row !== "object") return null;

  const sku =
    row.sku ?? row.SKU ?? row.Sku ?? row.ref ?? row.Ref ?? row.reference ?? row.id ?? row.barcode ?? "";

  const brand =
    row.brand ?? row.Brand ?? row.Marque ?? row.marque ?? row.brand_label ?? row.brand_slug ?? "";

  const model =
    row.model ?? row.Model ?? row.modele ?? row["Modèle"] ?? row.model_name ?? row.title ?? "";

  const color =
    row.color ?? row.Color ?? row.couleur ?? row["Couleur"] ?? row["Coloris"] ?? row.color_label ?? "";

  const color_code =
    row.color_code ?? row["Code couleur"] ?? row["Color code"] ?? undefined;

  const material =
    row.material ?? row.Material ?? row.matiere ?? row["Matière"] ?? undefined;

  const shape =
    row.shape ?? row.Shape ?? row.forme ?? row["Forme"] ?? undefined;

  const price_ht =
    toNumber(row.price_ht ?? row.PrixHT ?? row.prix_ht ?? row["Prix HT"] ?? row["Tarif HT"]) ?? undefined;

  const stock =
    toNumber(row.stock ?? row.Stock ?? row.qty ?? row.quantity ?? row["Quantité"] ?? row["Qté"] ?? row["Qte"]) ?? undefined;

  let image_url =
    row.image_url ?? row.image ?? row.Image ?? row["URL image"] ?? row["ImageURL"] ?? row["Photo"] ?? "";
  if (!image_url && Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    image_url = typeof first === "string" ? first : (first?.url ?? "");
  }

  const genderRaw =
    row.gender ?? row.Gender ?? row.category_label ?? row.category_slug ?? row["Catégorie"] ?? "";

  if (!brand && !model && !sku) return null;

  return {
    sku: String(sku || `${brand}-${model}-${color}`),
    brand: String(brand || "").trim(),
    model: String(model || "").trim(),
    color: String(color || "").trim(),
    material: material ? String(material) : undefined,
    shape: shape ? String(shape) : undefined,
    price_ht,
    stock,
    image_url: String(image_url || ""),
    color_code: color_code ? String(color_code) : undefined,
    gender: genderRaw ? String(genderRaw) : undefined,
  };
}

function extractArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

function normalizeGender(g?: string): "homme" | "femme" | "autre" {
  const v = (g || "").toString().toLowerCase();
  if (v.includes("homme") || v === "men" || v === "man" || v.includes("male")) return "homme";
  if (v.includes("femme") || v === "women" || v === "woman" || v.includes("female")) return "femme";
  return "autre";
}

export default function CatalogueMontures() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useCart();

  // 👉 une seule source de vérité : qui a le droit de voir les prix ?
  const canSeePrices =
    !!user &&
    user.enabled !== false &&
    (user.role === "client" || user.role === "admin" || user.role === "demo");

  const [items, setItems] = React.useState<Monture[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Onglets
  const [tab, setTab] = React.useState<"homme" | "femme">("homme");

  // Lightbox
  const [zoomSrc, setZoomSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);

      const candidates = ["/data/montures.json", "/montures.json"];
      let found: Monture[] | null = null;

      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) continue;
          const payload = await res.json();
          const arr = extractArray(payload).map(normalizeRow).filter(Boolean) as Monture[];
          if (arr.length) {
            found = arr;
            break;
          }
        } catch {}
      }

      if (!alive) return;

      if (found && found.length) setItems(found);
      else {
        setItems([]);
        setError("Catalogue introuvable ou vide. Vérifie public/data/montures.json (ou /montures.json).");
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  // Filtrage recherche + onglet
  const filtered = items
    .filter((it) => normalizeGender(it.gender) === tab)
    .filter((it) => {
      const s = `${it.brand} ${it.model} ${it.color} ${it.sku} ${it.material ?? ""} ${it.shape ?? ""} ${it.color_code ?? ""}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });

  const countHomme = items.filter((it) => normalizeGender(it.gender) === "homme").length;
  const countFemme = items.filter((it) => normalizeGender(it.gender) === "femme").length;

  // ESC ferme le zoom
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomSrc(null); };
    if (zoomSrc) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomSrc]);

  // Ajouter au panier ou forcer la connexion
  const onAddToCart = (p: Monture) => {
    if (!canSeePrices) {
      // redirige vers login et revient ici
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    addItem({
      id: p.sku,
      name: `${p.brand} ${p.model}${p.color_code ? " " + p.color_code : p.color ? " " + p.color : ""}`,
      price: p.price_ht ?? 0,
      qty: 1,
      image: p.image_url,
      meta: p,
    });
  };

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">
              <Link to="/" className="hover:text-white">Accueil</Link> / Catalogue / <span className="text-white">Montures</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold">Montures</h1>
            <p className="mt-1 text-slate-300">
              Sélection pro. Tarifs HT, stocks indicatifs {canSeePrices ? "" : "— connectez-vous pour voir les prix."}
            </p>
          </div>
          <Link to="/"><Button variant="secondary" className="bg-white/10 hover:bg-white/20">Retour</Button></Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setTab("homme")}
            className={`px-4 py-2 rounded-xl border ${tab === "homme" ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"} transition`}
          >
            Homme <span className="text-slate-400">({countHomme})</span>
          </button>
          <button
            onClick={() => setTab("femme")}
            className={`px-4 py-2 rounded-xl border ${tab === "femme" ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/10"} transition`}
          >
            Femme <span className="text-slate-400">({countFemme})</span>
          </button>
        </div>

        {/* Recherche */}
        <div className="mt-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher marque, modèle, couleur…"
            className="w-full md:w-96 rounded-xl bg-white/10 border border-white/10 px-4 py-2 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Etats */}
        {loading && <div className="mt-10 text-center text-slate-400">Chargement…</div>}
        {!loading && error && <div className="mt-10 text-center text-red-300">{error}</div>}

        {/* Grille */}
        {!loading && !error && (
          <>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <div key={p.sku} className="rounded-2xl bg-white/[0.04] shadow-sm hover:shadow-md transition p-3">
                  <div className="relative aspect-[4/3] rounded-xl bg-white/[0.06] overflow-hidden grid place-items-center">
                    {/* Code couleur dans l’image */}
                    {p.color_code && (
                      <div className="absolute left-2 top-2">
                        <Badge className="bg-black/40 border border-white/10 text-white">{p.color_code}</Badge>
                      </div>
                    )}
                    {/* Image -> zoom */}
                    <button onClick={() => setZoomSrc(p.image_url)} className="h-full w-full" title="Agrandir">
                      <img
                        src={p.image_url || "https://res.cloudinary.com/demo/image/upload/c_thumb,w_600,g_face/placeholder.png"}
                        alt={`${p.brand} ${p.model}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-slate-300">{p.brand}</div>
                    {typeof p.stock === "number" && (
                      <Badge className="bg-white/10 text-white">{p.stock > 0 ? "En stock" : "Sur demande"}</Badge>
                    )}
                  </div>

                  <div className="mt-1 font-medium">
                    {p.model} {p.color ? <span className="text-slate-400">— {p.color}</span> : null}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-slate-300 text-sm">
                      {p.material ?? ""}{p.shape ? (p.material ? " • " : "") + p.shape : ""}
                    </div>
                    {/* Prix strictement si connecté ET autorisé */}
                    {canSeePrices ? (
                      typeof p.price_ht === "number" ? (
                        <div className="font-semibold">{p.price_ht.toFixed(2)} € HT</div>
                      ) : null
                    ) : (
                      <div className="text-xs text-slate-400">Connectez-vous pour le prix</div>
                    )}
                  </div>

                  <Button
                    className="mt-3 w-full bg-[#0a59ff] hover:bg-[#084ad6]"
                    onClick={() => onAddToCart(p)}
                  >
                    {canSeePrices ? "Ajouter au panier" : "Se connecter pour commander"}
                  </Button>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-10 text-center text-slate-400">Aucun résultat.</div>
            )}
          </>
        )}

        {/* Lightbox / Zoom */}
        {zoomSrc && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setZoomSrc(null)}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setZoomSrc(null)}
                className="absolute -top-10 right-0 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
              >
                Fermer ✕
              </button>
              <img src={zoomSrc} alt="zoom" className="w-full max-h-[80vh] object-contain rounded-xl border border-white/10" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
