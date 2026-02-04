import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "./auth";

export default function RequireAdmin() {
  const auth = getAuth();
  if (!auth?.token) return <Navigate to="/login" replace />;
  if (auth.role !== "Admin") return <Navigate to="/profile" replace />;
  return <Outlet />;
}
