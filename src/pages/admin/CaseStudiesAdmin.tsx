import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string | null;
  status: string;
}

const defaultForm = { title: "", slug: "", client: "", industry: "", cover_image: "", problem: "", solution: "", results: "", testimonial: "", testimonial_author: "", status: "published" };
const industries = ["Technology", "Fintech", "Events", "Healthcare", "Retail", "Education", "Media", "Other"];

export default function CaseStudiesAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("case_studies").select("id, title, client, industry, status").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") };
    const { error } = editingId
      ? await supabase.from("case_studies").update(payload).eq("id", editingId)
      : await supabase.from("case_studies").insert([payload]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity(editingId ? "updated" : "created", "case_study", editingId || "new", form.title || "Case Study");
    toast({ title: editingId ? "Updated" : "Created" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this case study?")) return;
    await supabase.from("case_studies").delete().eq("id", id);
    await logActivity("deleted", "case_study", id, "Case Study");
    toast({ title: "Deleted" }); load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-black text-2xl">Case Studies</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm">
            <Plus className="w-4 h-4" /> New Case Study
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1A1A] border border-white/15 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-white font-bold text-xl mb-6">{editingId ? "Edit Case Study" : "New Case Study"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Title *</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Client *</label>
                    <input required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Industry</label>
                    <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all">
                      {industries.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Cover Image URL</label>
                    <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all" placeholder="https://..." />
                  </div>
                  {["problem", "solution", "results"].map((field) => (
                    <div key={field} className="col-span-2">
                      <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">{field}</label>
                      <textarea value={form[field as keyof typeof form]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all resize-none" />
                    </div>
                  ))}
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#F5D76E] transition-all">
                      <option>published</option><option>draft</option><option>archived</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-white font-semibold py-2.5 rounded-full btn-glow disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden">
          {loading ? <div className="p-12 text-center text-white/40">Loading...</div> :
           items.length === 0 ? <div className="p-12 text-center text-white/40">No case studies yet.</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-white/8 bg-black/20">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Client</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Industry</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody>{items.map((item, i) => (
                <tr key={item.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === items.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3 text-white text-sm font-medium line-clamp-1">{item.title}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden md:table-cell">{item.client}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden sm:table-cell">{item.industry ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${item.status === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>{item.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => { setEditingId(item.id); setForm({ ...defaultForm, title: item.title, client: item.client, industry: item.industry ?? "", status: item.status }); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.15)] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {isSuperAdmin && <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-[rgba(255,77,106,0.15)] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
