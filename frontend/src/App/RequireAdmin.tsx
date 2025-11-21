import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()

  const role = String(user?.role || "").toLowerCase()
  if (!user || role !== "admin") {
    return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  }
  return <>{children}</>
}
