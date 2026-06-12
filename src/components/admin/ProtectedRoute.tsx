import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060F1E] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[rgba(0,102,255,0.3)] border-t-[#0066FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
