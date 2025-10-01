// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";

const API_BASE =
  (import.meta.env?.VITE_API_AUTH_BASE?.trim().replace(/\/$/, "")) ||
  (typeof location !== "undefined" && location.hostname.endsWith("vercel.app")
    ? "https://opti-admin.vercel.app/api/site-ove"
    : "/api/site-ove");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OVELanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/compte" element={<AccountClientPortal apiBase={API_BASE} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
