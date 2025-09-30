import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();                 // ton contexte
  const hasToken = !!token || !!localStorage.getItem("ove_jwt"); // fallback
  const location = useLocation();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
