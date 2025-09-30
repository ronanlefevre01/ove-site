import React, { useState } from "react";
import { useCart } from "@/cart/CartContext";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function OrderConfirm() {
  const { items, totalHT, clear } = useCart();
  const { user } = useAuth();
  const [sent, setSent] = useState(false);

  function submit() {
    // 👉 remplace par un POST /api/orders
    const order = {
      created_at: new Date().toISOString(),
      customer_email: user?.email,
      lines: items,
      total_ht: totalHT
    };
    console.log("ORDER (mock) =>", order);
    setSent(true);
    clear();
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-white">
        <h1 className="text-3xl font-semibold">Commande envoyée ✅</h1>
        <p className="mt-2 text-slate-300">Nous confirmons la réception. Vous recevrez un récapitulatif par email.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold">Validation</h1>
      <p className="mt-2 text-slate-300">Commande sans paiement — un commercial vous recontacte.</p>

      <div className="mt-6 rounded-2xl bg-white/5 p-4">
        {items.map(l => (
          <div key={l.sku} className="flex items-center justify-between py-2 border-b border-white/10 last:border-none">
            <div>{l.brand} {l.model} <span className="text-slate-400">— {l.color}</span> x{l.qty}</div>
            {typeof l.price_ht === "number" && <div>{(l.price_ht*l.qty).toFixed(2)} € HT</div>}
          </div>
        ))}
        <div className="mt-4 flex items-center justify-between text-lg">
          <div>Total HT</div><div className="font-semibold">{totalHT.toFixed(2)} €</div>
        </div>
      </div>

      <Button className="mt-6 bg-[#0a59ff] hover:bg-[#084ad6]" onClick={submit}>Envoyer la commande</Button>
    </div>
  );
}
