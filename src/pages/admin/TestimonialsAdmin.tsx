import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  company: string | null;
  avatar_url: string | null;
  status: string;
}

const defaultForm = { quote: "", author_name: "", author_title: "", company: "", avatar_url: "", status: "published" };

export default function TestimonialsAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { error } = editingId
      ? await supabase.from("testimonials").update(form).eq("id", editingId)
      : await supabase.from("testimonials").insert([form]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingId ? "Updated" : "Added" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Deleted" }); load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-black text-2xl">Testimonials</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm">
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A2540] border border-white/15 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-white font-bold text-xl mb-6">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Quote *</label>
                  <textarea required value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all resize-none" placeholder="Client testimonial..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Author Name *</label>
                    <input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Title</label>
                    <input value={form.author_title} onChange={(e) => setForm({ ...form, author_title: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all" placeholder="CEO" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Company</label>
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all" />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#060F1E] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all">
                      <option>published</option><option>draft</option><option>archived</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/60 text-xs font-semibold uppercase mb-1 block">Avatar URL</label>
                    <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00E5FF] transition-all" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-white font-semibold py-2.5 rounded-full btn-glow disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update" : "Add"}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? <div className="text-center text-white/40 py-12">Loading...</div> :
           items.length === 0 ? <div className="text-center text-white/40 py-12">No testimonials yet.</div> :
           items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-5 flex gap-4 items-start">
              <Star className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm italic line-clamp-2">"{item.quote}"</p>
                <p className="text-white font-semibold text-sm mt-2">{item.author_name}</p>
                <p className="text-white/45 text-xs">{item.author_title} · {item.company}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize self-start ${item.status === "published" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>{item.status}</span>
                <button onClick={() => { setEditingId(item.id); setForm({ quote: item.quote, author_name: item.author_name, author_title: item.author_title ?? "", company: item.company ?? "", avatar_url: item.avatar_url ?? "", status: item.status }); setShowForm(true); }} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#0066FF] hover:bg-[rgba(0,102,255,0.15)] transition-colors"><Pencil className="w-3 h-3" /></button>
                {isSuperAdmin && <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-[rgba(255,77,106,0.15)] transition-colors"><Trash2 className="w-3 h-3" /></button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
