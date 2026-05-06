import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";


export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-ink-600">Checking your session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
