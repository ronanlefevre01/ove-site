// src/OVELanding.jsx
import React from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import {
  Check,
  ArrowRight,
  ShoppingBag,
  Smartphone,
  Shield,
  Truck,
  Sparkles,
  Layers,
  Stars,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OVELanding() {
  // ✦ IMPORTANT ✦
  // On ne fetch JAMAIS par défaut pour éviter CORS/404 en prod Vercel.
  // Si (et seulement si) tu fournis VITE_API_CONTENT_BASE, on essaie de charger /site-content dessus.
  const CONTENT_BASE = "";

  const defaultContent = {
    site: {
      brand: "OVE Distribution",
      claim: "B2B pour opticiens",
      ctaLogin: "Se connecter B2B",
      ctaOpen: "Ouvrir un compte",
      contactEmail: "contact@ovedistribution.com",
      contactPhone: "+33 3 68 38 68 22",
    },
    hero: {
      badge: "B2B pour opticiens",
      title: "Montures, accessoires & outils logiciels",
      subtitleAccent: "pensés pour la performance en magasin",
      description:
        "Des gammes sélectionnées, des prix clairs, un service fiable. Et une suite d’apps (OptiMesure, OptiCOM, OptiRH) pour doper vos ventes et votre productivité.",
      primary: "Voir le catalogue",
      secondary: "Demander un accès",
      highlights: [
        { icon: "Shield", text: "Tarifs pro" },
        { icon: "Truck", text: "Expédition 24/48h" },
        { icon: "ShoppingBag", text: "Dépôt-vente possible" },
      ],
      rightBadge: "Nouvelles collections",
      galleryPlaceholders: 9,
    },
    catalogue: {
      title: "Parcourir le catalogue",
      viewAll: "Tout voir",
      cards: [
        { label: "Lunettes", desc: "Acétate, métal, enfants", tag: "+120 réf.", cta: "Consulter" },
        { label: "Accessoires", desc: "Étuis, microfibres, chaînes", tag: "Top ventes", cta: "Consulter" },
        { label: "Équipement", desc: "Outils, consommables atelier", tag: "Pro", cta: "Consulter" },
        { label: "Nouveautés", desc: "Sélection du mois", tag: "Nouveau", cta: "Consulter" },
      ],
    },
    apps: {
      title: "Suite d’outils OVE",
      viewAll: "Découvrir",
      items: [
        { name: "OptiMesure", pitch: "Mesures EP/HP, angle panto, DVO", badge: "iPad & Android" },
        { name: "OptiCOM", pitch: "SMS B2C, rappels, campagnes", badge: "RGPD ready" },
        { name: "OptiRH", pitch: "Congés, bonus, annonces", badge: "Multi-magasins" },
      ],
    },
    advantages: {
      items: [
        { icon: "Shield", title: "Prix pro transparents", desc: "Grilles nettes, sans surprise. Paliers quantitatifs disponibles." },
        { icon: "Truck", title: "Logistique fiable", desc: "Stocks maîtrisés, expédition 24/48h, suivi de colis." },
        { icon: "Layers", title: "Offre complète", desc: "Lunettes, accessoires, équipement & logiciels intégrés." },
      ],
      deposit: {
        title: "Passer en dépôt-vente, c’est facile",
        text: "On vous livre, vous exposez, vous payez uniquement ce qui est vendu. Documents et suivis fournis.",
        cta: "Demander le pack d’infos",
      },
    },
    lead: {
      title: "Accédez à nos tarifs & collections",
      text: "Créez votre compte B2B en 1 minute. Réservé aux professionnels.",
      placeholder: "Email professionnel",
      cta: "Demander un accès",
      bulletsTitle: "Déjà adopté par des dizaines d’opticiens",
      bullets: ["Photos e-commerce disponibles", "SAV réactif", "Conditions dépôt-vente", "Intégration Strapi/Shop"],
      legal: "En validant, vous acceptez nos CGV et notre politique de confidentialité.",
    },
    footer: {
      about: "Solutions complètes pour opticiens : produits, services, logiciels.",
      columns: {
        Catalogue: ["Montures", "Accessoires", "Équipement", "Nouveautés"],
        Ressources: ["CGV", "Politique de confidentialité", "Dépôt-vente", "Support"],
        Contact: [],
      },
    },
  } as const;

  const [content, setContent] = React.useState<any>(defaultContent);

  React.useEffect(() => {
    if (!CONTENT_BASE) return; // pas d’URL -> pas d’appel -> pas d’erreur console
    (async () => {
      try {
        const base = CONTENT_BASE.replace(/\/$/, "");
        const res = await fetch(`${base}/site-content`, { cache: "no-store" });
        if (!res.ok) return;
        const txt = await res.text();
        if (!txt) return;
        try {
          const remote = JSON.parse(txt);
          setContent({ ...defaultContent, ...remote });
        } catch {
          // JSON invalide : on ignore
        }
      } catch {
        // réseau/CORS : on ignore
      }
    })();
  }, []); // mount only

  const IconMap = { Shield, Truck, ShoppingBag, Smartphone, Stars, Layers } as const;

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 80% -10%, rgba(10,89,255,.15), transparent), " +
          "radial-gradient(900px 400px at -10% 20%, rgba(0,194,168,.12), transparent), #0b0f1a",
      }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0a59ff] to-[#00c2a8] grid place-items-center shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight text-lg">{content.site.brand}</span>
          </div>

          <nav className="ml-auto hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link className="hover:text-white transition" to="/catalogue/montures">Catalogue</Link>
            <a className="hover:text-white transition" href="#apps">Applications</a>
            <a className="hover:text-white transition" href="#avantages">Pourquoi OVE</a>
            <a className="hover:text-white transition" href="#contact">Contact</a>
          </nav>

          <div className="ml-4 hidden md:flex items-center gap-2">
            {/* Se connecter B2B -> /compte */}
            <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20">
              <Link to="/compte">{content.site.ctaLogin}</Link>
            </Button>

            {/* Ouvrir un compte -> route à définir */}
            <Button asChild className="bg-[#0a59ff] hover:bg-[#084ad6]">
              <Link to="/ouvrir-un-compte">{content.site.ctaOpen}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-white/10 text-white shadow-sm">{content.hero.badge}</Badge>
            <h1 className="mt-6 text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              {content.hero.title}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0a59ff] to-[#00c2a8]">
                {content.hero.subtitleAccent}
              </span>
            </h1>
            <p className="mt-5 text-slate-300 max-w-xl">{content.hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-[#0a59ff] hover:bg-[#084ad6]" asChild>
                <Link to="/catalogue/montures">
                  {content.hero.primary} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20">
                {content.hero.secondary}
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-slate-400">
              {content.hero.highlights?.map((h: any, i: number) => {
                const Ico = (IconMap as any)[h.icon] || Check;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Ico className="h-4 w-4" /> {h.text}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#0a59ff]/30 to-[#00c2a8]/20 shadow-2xl p-2">
              <div className="h-full w-full rounded-2xl bg-[conic-gradient(at_30%_30%,#1b2a4d_0deg,#0e1526_90deg,#1b2a4d_180deg,#0e1526_270deg,#1b2a4d_360deg)] grid place-items-center">
                <div className="grid grid-cols-3 gap-3 p-5 w-full">
                  {Array.from({ length: content.hero.galleryPlaceholders || 9 }).map((_, i) => (
                    <div key={i} className="rounded-2xl h-28 bg-white/5 backdrop-blur-sm grid place-items-center">
                      <div className="h-10 w-20 rounded-full bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rotate-[-2deg]">
              <Badge className="bg-[#00c2a8] text-[#0b0f1a] shadow-sm">{content.hero.rightBadge}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold">{content.catalogue.title}</h2>
          <Button variant="link" className="text-white">{content.catalogue.viewAll}</Button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.catalogue.cards?.map((c: any, idx: number) => (
            <Card key={idx} className="rounded-2xl bg-white/[0.04] shadow-sm hover:shadow-md transition">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center justify-between">
                  <span>{c.label}</span>
                  <Badge className="bg-white/10 text-white shadow-sm">{c.tag}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] rounded-xl bg-white/[0.06] grid place-items-center">
                  <div className="h-10 w-24 rounded-full bg-white/25" />
                </div>
                <p className="mt-3 text-sm text-slate-300">{c.desc}</p>
                <Button className="mt-4 w-full bg-[#0a59ff] hover:bg-[#084ad6]">
                  {c.cta || "Consulter"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* APPS */}
      <section id="apps" className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold">{content.apps.title}</h2>
          <Button variant="link" className="text-white">{content.apps.viewAll}</Button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.apps.items?.map((app: any, i: number) => (
            <Card key={i} className="rounded-2xl bg-white/[0.04] shadow-sm hover:shadow-md transition">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0a59ff] to-[#00c2a8] grid place-items-center">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  {app.name}
                  <Badge className="ml-auto bg-white/10 text-white shadow-sm">{app.badge}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{app.pitch}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Installation simple</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Licence par opticien</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Support réactif</li>
                </ul>
                <Button className="mt-4 w-full bg-white/10 hover:bg-white/20">En savoir plus</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <div className="grid md:grid-cols-3 gap-4">
          {content.advantages.items?.map((v: any, i: number) => {
            const Ico = (IconMap as any)[v.icon] || Shield;
            return (
              <Card key={i} className="rounded-2xl bg-white/[0.04] shadow-sm hover:shadow-md transition">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-white/90">
                    <Ico className="h-5 w-5" /> {v.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{v.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-[#0a59ff]/15 to-[#00c2a8]/10 p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-semibold">{content.advantages.deposit.title}</h3>
              <p className="mt-2 text-slate-300">{content.advantages.deposit.text}</p>
            </div>
            <Button size="lg" className="bg-white text-[#0b0f1a] hover:bg-white/90">
              {content.advantages.deposit.cta}
            </Button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / LEAD */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-12">
        <Card className="rounded-2xl bg-white/[0.04] shadow-sm hover:shadow-md transition">
          <CardContent className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-2xl font-semibold">{content.lead.title}</h3>
                <p className="mt-2 text-slate-300">{content.lead.text}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder={content.lead.placeholder}
                    className="bg-white/10 placeholder:text-slate-400"
                  />
                  <Button className="bg-[#0a59ff] hover:bg-[#084ad6]">{content.lead.cta}</Button>
                </div>
                <p className="mt-2 text-xs text-slate-400">{content.lead.legal}</p>
              </div>

              <div className="relative">
                <div className="rounded-2xl bg-white/5 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Stars className="h-5 w-5" />
                    <span className="text-white/90 font-medium">{content.lead.bulletsTitle}</span>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                    {content.lead.bullets?.map((b: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8 text-sm text-slate-300">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0a59ff] to-[#00c2a8]" />
              <span className="font-semibold text-white">{content.site.brand}</span>
            </div>
            <p className="mt-3">{content.footer.about}</p>
          </div>

          {Object.entries(content.footer.columns).map(([col, items]: any, i) => (
            <div key={i}>
              <div className="text-white font-medium">{col}</div>
              <ul className="mt-3 space-y-2">
                {items?.length ? (
                  items.map((it: string, k: number) => (
                    <li key={k}>
                      <a href="#" className="hover:text-white">
                        {it}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">
                    {content.site.contactEmail}
                    <br />
                    {content.site.contactPhone}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center py-6 text-xs text-slate-400">
          © {new Date().getFullYear()} {content.site.brand} — Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
