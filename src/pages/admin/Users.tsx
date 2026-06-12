import { useCallback, useEffect, useState } from "react";
import { Users as UsersIcon, Plus, ShieldAlert, Shield, Mail, X, Crown, CheckCircle, Copy, Check, Key } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserRecord {
  id: string;
  full_name: string | null;
  role: "super_admin" | "admin";
  avatar_url: string | null;
  created_at: string;
}

interface InviteResult {
  email: string;
  emailSent: boolean;
  tempPassword?: string;
}

const ROLE_STYLES = {
  super_admin: "text-[#F5D76E] bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.3)]",
  admin: "text-white/60 bg-white/5 border-white/15",
};

function CredentialsModal({ result, onClose }: { result: InviteResult; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    try {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } catch { fallbackCopy(text); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.focus(); el.select();
    try { document.execCommand("copy"); } catch { /* silent */ }
    document.body.removeChild(el);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-card rounded-2xl border border-[rgba(212,175,55,0.25)] p-8 w-full max-w-md shadow-luxury">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-white font-display font-black text-xl mb-1">Admin Invited!</h2>
          <p className="text-white/40 text-sm">
            {result.emailSent
              ? "An invitation email with login credentials has been sent."
              : "Account created. Share these credentials with the admin:"}
          </p>
        </div>

        <div className="bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.2)] rounded-xl p-5 space-y-4 mb-6">
          <div>
            <span className="text-white/35 text-[10px] uppercase tracking-wider block mb-1">Email Address</span>
            <span className="text-white font-medium text-sm">{result.email}</span>
          </div>
          {result.tempPassword && (
            <div>
              <span className="text-white/35 text-[10px] uppercase tracking-wider block mb-1">Temporary Password</span>
              <div className="flex items-center gap-3">
                <span className="text-[#F5D76E] font-mono font-bold text-lg tracking-wider flex-1">{result.tempPassword}</span>
                <button
                  onClick={() => copy(result.tempPassword!)}
                  className="flex items-center gap-1.5 text-xs border border-[rgba(212,175,55,0.3)] text-[#D4AF37] px-3 py-1.5 rounded-lg hover:bg-[rgba(212,175,55,0.1)] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
          {result.emailSent && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <Mail className="w-3.5 h-3.5 text-green-400/70" />
              <span className="text-green-400/70 text-xs">Invitation email sent successfully</span>
            </div>
          )}
        </div>

        {result.tempPassword && (
          <p className="text-white/25 text-xs text-center mb-5">
            Share these credentials securely. The admin should change their password after first login.
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full gradient-brand text-[#0A0A0A] font-bold py-3 rounded-full btn-glow"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function Users() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "admin" as "admin" | "super_admin" });
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin, load]);

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Access Restricted</h2>
          <p className="text-white/50 text-sm max-w-xs">Only Super Admins can manage users and roles.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "super_admin") => {
    if (userId === currentUser?.id) {
      toast({ title: "Cannot change your own role", variant: "destructive" });
      return;
    }
    await supabase.from("user_profiles").update({ role: newRole }).eq("id", userId);
    toast({ title: "Role updated" });
    load();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email: inviteForm.email, full_name: inviteForm.full_name, role: inviteForm.role },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Show success modal with credentials
      setInviteResult({
        email: inviteForm.email,
        emailSent: data.email_sent === true,
        tempPassword: data.temp_password,
      });
      setShowInvite(false);
      setInviteForm({ email: "", full_name: "", role: "admin" });
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Invite failed", description: msg, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  return (
    <AdminLayout>
      {/* Credentials modal */}
      {inviteResult && (
        <CredentialsModal result={inviteResult} onClose={() => setInviteResult(null)} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Users & Roles</h1>
            <p className="text-white/40 text-sm mt-0.5">{users.length} admin account{users.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Invite Admin
          </button>
        </div>

        {/* Invite Form */}
        {showInvite && (
          <div className="glass-card rounded-2xl p-6 border border-[rgba(212,175,55,0.2)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Invite New Admin</h2>
                <p className="text-white/30 text-xs mt-0.5">A secure password will be generated and emailed automatically</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleInvite} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Email *</label>
                <input required type="email" value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Full Name</label>
                <input type="text" value={inviteForm.full_name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Role</label>
                <select value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as "admin" | "super_admin" }))}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3 items-center">
                <button type="submit" disabled={inviting}
                  className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-6 py-2.5 rounded-full btn-glow disabled:opacity-50 transition-all">
                  {inviting ? (
                    <><span className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" /> Creating account…</>
                  ) : (
                    <><Key className="w-4 h-4" /> Send Invite</>
                  )}
                </button>
                <button type="button" onClick={() => setShowInvite(false)}
                  className="border border-white/15 text-white/60 px-5 py-2.5 rounded-full hover:border-white/30 hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-white/30">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <UsersIcon className="w-12 h-12 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="text-right px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isYou = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                            <span className="text-[#0A0A0A] font-black text-xs">{(u.full_name || "A").charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm flex items-center gap-1.5">
                              {u.full_name || "Admin User"}
                              {isYou && <span className="text-[10px] text-[#D4AF37]/60 border border-[rgba(212,175,55,0.2)] rounded-full px-1.5">You</span>}
                            </div>
                            <div className="text-white/25 text-xs font-mono">{u.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide border rounded-full px-2.5 py-1 ${ROLE_STYLES[u.role]}`}>
                          {u.role === "super_admin" ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {u.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-white/30 text-sm">{new Date(u.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!isYou ? (
                            <select value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as "admin" | "super_admin")}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#D4AF37]/50 cursor-pointer">
                              <option value="admin" className="bg-[#1A1A1A]">Admin</option>
                              <option value="super_admin" className="bg-[#1A1A1A]">Super Admin</option>
                            </select>
                          ) : (
                            <span className="text-white/20 text-xs italic">current session</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Security note */}
        <div className="glass-card rounded-xl p-4 border border-[rgba(212,175,55,0.1)] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]/60 flex-shrink-0 mt-0.5" />
          <p className="text-white/30 text-xs leading-relaxed">
            All admin accounts have full CMS access. Super Admins can manage users and all settings. When you invite a user, a secure temporary password is generated and emailed to them automatically.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
