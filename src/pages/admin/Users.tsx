import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function Users() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,77,106,0.15)] border border-[rgba(255,77,106,0.3)] flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Restricted</h2>
          <p className="text-white/50 text-sm">Only Super Admins can manage users and roles.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-white font-black text-2xl">Users & Roles</h1>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-white/60 text-sm mb-4">
            To add admin users, invite them via the authentication system and assign their role.
          </p>
          <p className="text-white/40 text-xs">
            Users are managed through the authentication system. Contact your system administrator to add new admins.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
