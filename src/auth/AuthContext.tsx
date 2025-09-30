import React, { createContext, useContext, useEffect, useState } from "react";

type AuthCtx = {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({ token: null, login: () => {}, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ove_jwt");
    if (saved) setToken(saved);
  }, []);

  const login = (t: string) => {
    localStorage.setItem("ove_jwt", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("ove_jwt");
    setToken(null);
  };

  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>;
};
