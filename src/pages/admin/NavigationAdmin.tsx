import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown, ExternalLink, Menu } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface NavItem {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
}

const emptyForm = { label: "", href: "", parent_id: null as string | null, sort_order: 0, is_active: true, opens_new_tab: false };

export default function NavigationAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("navigation_items").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const topLevel = items.filter((i) => !i.parent_id);
  const getChildren = (parentId: string) => items.filter((i) => i.parent_id === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, sort_order: form.sort_order || items.length + 1 };
    let id = editId;
    if (editId) {
      const { error } = await supabase.from("navigation_items").update(payload).eq("id", editId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("navigation_items").insert([payload]).select().maybeSingle();
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      id = data?.id;
    }
    await logActivity(editId ? "updated" : "created", "navigation", id || "", form.label);
    toast({ title: editId ? "Menu item updated" : "Menu item added" });
    setShowForm(false); setEditId(null); setForm(emptyForm); load();
    setSaving(false);
  };

  const handleEdit = (item: NavItem) => {
    setEditId(item.id);
    setForm({ label: item.label, href: item.href, parent_id: item.parent_id, sort_order: item.sort_order, is_active: item.is_active, opens_new_tab: item.opens_new_tab });
    setShowForm(true);
  };

  const handleDelete = async (item: NavItem) => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    await supabase.from("navigation_items").delete().eq("id", item.id);
    await logActivity("deleted", "navigation", item.id, item.label);
    toast({ title: "Deleted" });
    load();
  };

  const moveOrder = async (item: NavItem, direction: "up" | "down") => {
    const peers = items.filter((i) => i.parent_id === item.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const idx = peers.findIndex((i) => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= peers.length) return;
    const sibling = peers[swapIdx];
    await Promise.all([
      supabase.from("navigation_items").update({ sort_order: sibling.sort_order }).eq("id", item.id),
      supabase.from("navigation_items").update({ sort_order: item.sort_order }).eq("id", sibling.id),
    ]);
    load();
  };

  const toggleActive = async (item: NavItem) => {
    await supabase.from("navigation_items").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  };

  const set = (k: keyof typeof emptyForm, v: string | boolean | null) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Navigation Manager</h1>
            <p className="text-white/40 text-sm mt-0.5">Manage website menu items and submenus</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Add Menu Item
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 border border-[rgba(212,175,55,0.2)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{editId ? "Edit" : "Add"} Menu Item</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Label *</label>
                <input required value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Services"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">URL / Path *</label>
                <input required value={form.href} onChange={(e) => set("href", e.target.value)} placeholder="e.g. /services or https://…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Parent (for submenus)</label>
                <select value={form.parent_id || ""} onChange={(e) => set("parent_id", e.target.value || null)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50">
                  <option value="">Top Level (no parent)</option>
                  {topLevel.filter((i) => i.id !== editId).map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div className="flex gap-5 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                  <span className="text-white/60 text-sm">Active (visible in menu)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.opens_new_tab} onChange={(e) => set("opens_new_tab", e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                  <span className="text-white/60 text-sm">Open in new tab</span>
                </label>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : editId ? "Update Item" : "Add Item"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-white/15 text-white/60 px-5 py-2.5 rounded-full hover:border-white/30 hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Navigation Tree */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Loading…</div>
        ) : (
          <div className="space-y-3">
            {topLevel.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-2xl">
                <Menu className="w-12 h-12 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No navigation items yet</p>
              </div>
            ) : topLevel.map((item) => {
              const children = getChildren(item.id);
              return (
                <div key={item.id} className="glass-card rounded-2xl overflow-hidden">
                  {/* Parent item */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-2 h-2 rounded-full ${item.is_active ? "bg-[#D4AF37]" : "bg-white/20"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.label}</span>
                        {item.opens_new_tab && <ExternalLink className="w-3.5 h-3.5 text-white/30" />}
                        {!item.is_active && <span className="text-white/30 text-xs border border-white/10 rounded-full px-2">hidden</span>}
                      </div>
                      <span className="text-white/30 text-xs">{item.href}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => moveOrder(item, "up")} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveOrder(item, "down")} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleActive(item)} className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 transition-all ${item.is_active ? "border-green-400/25 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/25" : "border-white/15 text-white/30 hover:border-green-400/25 hover:text-green-400"}`}>
                        {item.is_active ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => handleEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {/* Children (submenus) */}
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 px-5 py-3 border-t border-white/5 pl-12 bg-white/[0.02]">
                      <div className={`w-1.5 h-1.5 rounded-full ${child.is_active ? "bg-[#D4AF37]/60" : "bg-white/10"}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-white/70 text-sm">{child.label}</span>
                        <span className="text-white/25 text-xs ml-2">{child.href}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(child)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(child)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
