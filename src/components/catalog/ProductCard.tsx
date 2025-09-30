// src/components/catalog/ProductCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "./types";
import { cld } from "@/lib/cloudinary";

type Props = { p: Product };

export default function ProductCard({ p }: Props) {
  const img = p.images?.[0];

  // Variantes responsive (tu peux ajuster les largeurs)
  const w400 = img ? cld(img, "f_auto,q_auto,w_400,c_fill,g_auto") : "";
  const w800 = img ? cld(img, "f_auto,q_auto,w_800,c_fill,g_auto") : "";
  const w1200 = img ? cld(img, "f_auto,q_auto,w_1200,c_fill,g_auto") : "";

  // Placeholder flou (optionnel) : gros blur très léger en fallback
  const blur = img ? cld(img, "e_blur:1000,q_1,w_20") : "";

  return (
    <Card className="bg-white/5 hover:bg-white/[.06] transition">
      <CardHeader className="pb-3">
        <CardTitle className="text-white/90 text-base flex items-center justify-between">
          <span className="truncate">{p.title}</span>
          {p.material ? <Badge className="bg-white/10">{p.material}</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-white/5 grid place-items-center">
          {img ? (
            <img
              src={w800}
              srcSet={`${w400} 400w, ${w800} 800w, ${w1200} 1200w`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              alt={p.title}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              style={{ background: `url(${blur}) center/cover no-repeat` }}
            />
          ) : (
            <div className="h-10 w-24 rounded-full bg-white/20" />
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <div>
            <div className="font-medium text-white/90">{p.brand_label}</div>
            <div className="text-slate-400">
              {p.color_label}
              {p.size_a ? ` · A${p.size_a}` : ""}{p.size_d ? ` · D${p.size_d}` : ""}
            </div>
          </div>
          <div className="text-right">
            {typeof p.price_ttc === "number" && (
              <>
                <div className="font-semibold">{p.price_ttc.toFixed(2)} € TTC</div>
                {typeof p.price_ht === "number" && (
                  <div className="text-xs text-slate-400">{p.price_ht.toFixed(2)} € HT</div>
                )}
              </>
            )}
          </div>
        </div>

        <Button className="mt-4 w-full bg-[#0a59ff] hover:bg-[#084ad6]">Consulter</Button>
      </CardContent>
    </Card>
  );
}
