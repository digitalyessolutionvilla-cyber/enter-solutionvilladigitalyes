import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  photo_url: string | null;
}

const defaultForm = { name: "", position: "", department: "General", bio: "", photo_url: "", linkedin: "", twitter: "", status: "active" };
const departments = ["Leadership", "Technology", "Design", "Marketing", "Events", "General"];

export default function TeamAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("team_members").select("id, name, position, department, status, photo_url").order("sort_order");
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = editingId
      ? await supabase.from("team_members").update(form).eq("id", editingId)
      : await supabase.from("team_members").insert([form]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingId ? "Member updated" : "Member added" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    toast({ title: "Member removed" }); load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-black text-2xl">Team Members</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1A1A] border border-white/15 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-white font-bold text-xl mb-6">{editingId ? "Edit Member" : "Add Team Member"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Full Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Position *</label>
                    <input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Department</label>
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all">
                      {departments.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Photo URL</label>
                    <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">LinkedIn URL</label>
                    <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Twitter URL</label>
                    <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-white font-semibold py-2.5 rounded-full btn-glow disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update" : "Add Member"}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? <p className="col-span-full text-center text-white/40 py-12">Loading...</p> :
           members.length === 0 ? <p className="col-span-full text-center text-white/40 py-12">No team members yet.</p> :
           members.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 text-center relative group">
              <img src={m.photo_url ?? `https://ui-avatars.com/api/?name=${m.name}&background=0066FF&color=fff`} alt={m.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[rgba(212,175,55,0.4)]" />
              <p className="text-white font-bold text-sm">{m.name}</p>
              <p className="text-[#F5D76E] text-xs mt-0.5">{m.position}</p>
              <p className="text-white/40 text-xs mt-0.5">{m.department}</p>
              <div className="flex gap-1.5 justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(m.id); setForm({ name: m.name, position: m.position, department: m.department, bio: "", photo_url: m.photo_url ?? "", linkedin: "", twitter: "", status: m.status }); setShowForm(true); }} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
                {isSuperAdmin && <button onClick={() => handleDelete(m.id)} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-red-400 hover:bg-[rgba(255,77,106,0.2)] transition-colors"><Trash2 className="w-3 h-3" /></button>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
