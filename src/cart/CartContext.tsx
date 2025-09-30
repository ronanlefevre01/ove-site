import React, { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  sku: string; brand: string; model: string; color?: string;
  price_ht?: number; qty: number; image_url?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  totalHT: number;
};

const Ctx = createContext<CartCtx | undefined>(undefined);
export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within <CartProvider>");
  return c;
};

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const add: CartCtx["add"] = (item, qty=1) => {
    setItems(prev => {
      const i = prev.findIndex(x=>x.sku===item.sku);
      if (i>=0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const remove = (sku: string) => setItems(prev => prev.filter(i=>i.sku!==sku));
  const clear = () => setItems([]);

  const totalHT = useMemo(
    ()=> items.reduce((s,i)=> s + (i.price_ht||0)*i.qty, 0),
    [items]
  );

  return <Ctx.Provider value={{ items, add, remove, clear, totalHT }}>{children}</Ctx.Provider>;
};
