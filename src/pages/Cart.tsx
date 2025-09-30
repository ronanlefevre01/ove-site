import React from "react";
import { useCart } from "@/cart/CartContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, remove, totalHT, clear } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold">Panier</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-slate-300">Votre panier est vide.</p>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map(it=>(
              <li key={it.sku} className="rounded-xl bg-white/5 p-4 flex items-center gap-4">
                {it.image_url && <img className="h-14 w-20 object-cover rounded" src={it.image_url} />}
                <div className="flex-1">
                  <div className="font-medium">{it.brand} {it.model} <span className="text-slate-400">— {it.color}</span></div>
                  <div className="text-sm text-slate-400">x{it.qty}</div>
                </div>
                {typeof it.price_ht === "number" && <div className="font-semibold">{(it.price_ht*it.qty).toFixed(2)} € HT</div>}
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20" onClick={()=>remove(it.sku)}>Retirer</Button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg">Total HT</div>
            <div className="text-xl font-semibold">{totalHT.toFixed(2)} €</div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20" onClick={clear}>Vider</Button>
            <Button className="bg-[#0a59ff] hover:bg-[#084ad6]" onClick={()=>location.assign("/commande")}>
              Valider la commande
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
