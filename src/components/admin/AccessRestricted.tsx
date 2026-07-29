import { ShieldAlert } from "lucide-react";
import AdminLayout from "./AdminLayout";

interface AccessRestrictedProps {
  title?: string;
  description?: string;
}

/**
 * Shared "Access Restricted" screen, rendered inside the admin shell so the
 * sidebar remains available for navigation to permitted sections.
 *
 * Used by ProtectedRoute (direct-URL / role-gated routes) and the Users page.
 */
export default function AccessRestricted({ title, description }: AccessRestrictedProps) {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">{title ?? "Access Restricted"}</h2>
        <p className="text-white/50 text-sm max-w-xs">
          {description ?? "You don't have permission to access this section."}
        </p>
      </div>
    </AdminLayout>
  );
}
