import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { StaffRole } from "@/lib/adminPermissions";
import { hasRole } from "@/lib/adminPermissions";
import AccessRestricted from "./AccessRestricted";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role allow-list. Omitted = any authenticated staff (Dashboard). */
  roles?: StaffRole[];
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[rgba(212,175,55,0.3)] border-t-[#D4AF37] rounded-full animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, profile, profileLoading } = useAuth();

  // Auth not ready yet.
  if (loading) return <FullScreenSpinner />;

  if (!user) return <Navigate to="/admin/login" replace />;

  // Role-gated route: wait for the profile to load before deciding, so we
  // never flash "Access Restricted" for a user who actually has access.
  if (roles) {
    if (profileLoading) return <FullScreenSpinner />;
    if (!hasRole(profile?.role, roles)) return <AccessRestricted />;
  }

  return <>{children}</>;
}
