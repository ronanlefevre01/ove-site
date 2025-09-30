import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function Account() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold">Mon espace</h1>
      <p className="mt-2 text-slate-300">Bonjour {user?.name || user?.email}.</p>
      <div className="mt-6">
        <Button onClick={logout} variant="secondary" className="bg-white/10 hover:bg-white/20">Se déconnecter</Button>
      </div>
    </div>
  );
}
