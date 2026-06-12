import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  client: string | null;
  year: number | null;
  status: string;
  image_url: string | null;
}

const defaultForm = { title: "", category: "Branding", description: "", image_url: "", client: "", year: new Date().getFullYear(), status: "published" };
const categories = ["Branding", "Websites", "Mobile Apps", "Events", "Media", "Software", "Printing", "Marketing"];

export default function PortfolioAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_items").select("id, title, category, client, year, status, image_url").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = editingId
      ? await supabase.from("portfolio_items").update(form).eq("id", editingId)
      : await supabase.from("portfolio_items").insert([form]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity(editingId ? "updated" : "created", "portfolio_item", editingId || "new", form.title);
    toast({ title: editingId ? "Item updated" : "Item created" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  // ✅ Fixed: fetch FULL record before opening editor
  const handleEdit = async (itemId: string) => {
    setLoadingEdit(true);
    const { data } = await supabase.from("portfolio_items").select("*").eq("id", itemId).maybeSingle();
    setLoadingEdit(false);
    if (!data) return;
    setEditingId(data.id);
    setForm({
      title: data.title ?? "",
      category: data.category ?? "Branding",
      description: data.description ?? "",
      image_url: data.image_url ?? "",
      client: data.client ?? "",
      year: data.year ?? new Date().getFullYear(),
      status: data.status ?? "published",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id);
    await logActivity("deleted", "portfolio_item", id, "Portfolio Item");
    toast({ title: "Item deleted" }); load();
  };

  const f = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-black text-2xl">Portfolio</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">{editingId ? "Edit Item" : "New Portfolio Item"}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Title *</label>
                  <input required value={form.title} onChange={(e) => f("title", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Category</label>
                    <select value={form.category} onChange={(e) => f("category", e.target.value)} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => f("status", e.target.value)} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all">
                      <option>published</option><option>draft</option><option>archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Client</label>
                    <input value={form.client} onChange={(e) => f("client", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Year</label>
                    <input type="number" value={form.year} onChange={(e) => f("year", parseInt(e.target.value))} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Image URL</label>
                  <input value={form.image_url} onChange={(e) => f("image_url", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" placeholder="https://..." />
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Description</label>
                  <textarea value={form.description} onChange={(e) => f("description", e.target.value)} rows={3} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-[#0A0A0A] font-bold py-2.5 rounded-full btn-glow disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? <div className="p-12 text-center text-white/40">Loading...</div> : items.length === 0 ? <div className="p-12 text-center text-white/40">No portfolio items yet.</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-white/8 bg-black/20">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Client</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody>{items.map((item, i) => (
                <tr key={item.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i === items.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden md:table-cell">{item.category}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden sm:table-cell">{item.client ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${item.status === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>{item.status}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => handleEdit(item.id)} disabled={loadingEdit} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.15)] transition-colors disabled:opacity-40"><Pencil className="w-3.5 h-3.5" /></button>
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
