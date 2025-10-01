// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OVELanding from "./OVELanding";
import LoginPage from "./pages/login";
import AccountClientPortal from "./components/AccountClientPortal";
import RequireAuth from "./RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OVELanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/compte"
          element={
            <RequireAuth>
              <AccountClientPortal />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
