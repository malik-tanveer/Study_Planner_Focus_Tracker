import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ✅ Wait until Firebase auth finishes loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg font-semibold tracking-wide">
          Checking authentication...
        </div>
      </div>
    );
  }

  // ✅ Redirect only if user is confirmed null
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
