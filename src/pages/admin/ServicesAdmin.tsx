import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff, Palette, TrendingUp, Video, Film, Globe, Printer, Briefcase, Smartphone, Code2, Cloud, Star, Zap, Shield, Target, Users, Heart, Lightbulb, Award, CheckCircle } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
  sort_order: number;
  is_active: boolean;
  link_href: string;
}

const ICON_OPTIONS = [
  { name: "Palette", component: Palette },
  { name: "TrendingUp", component: TrendingUp },
  { name: "Video", component: Video },
  { name: "Film", component: Film },
  { name: "Globe", component: Globe },
  { name: "Printer", component: Printer },
  { name: "Briefcase", component: Briefcase },
  { name: "Smartphone", component: Smartphone },
  { name: "Code2", component: Code2 },
  { name: "Cloud", component: Cloud },
  { name: "Star", component: Star },
  { name: "Zap", component: Zap },
  { name: "Shield", component: Shield },
  { name: "Target", component: Target },
  { name: "Users", component: Users },
  { name: "Heart", component: Heart },
  { name: "Lightbulb", component: Lightbulb },
  { name: "Award", component: Award },
  { name: "CheckCircle", component: CheckCircle },
];

function getIcon(name: string) {
  return ICON_OPTIONS.find((i) => i.name === name)?.component || Globe;
}

const emptyForm = { icon: "Globe", title: "", description: "", tag: "", link_href: "/#services", is_active: true };

function SortableServiceRow({ service, onEdit, onToggle, onDelete }: {
  service: Service;
  onEdit: (s: Service) => void;
  onToggle: (s: Service) => void;
  onDelete: (s: Service) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });
  const Icon = getIcon(service.icon);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="glass-card rounded-xl flex items-center gap-4 px-4 py-4 group"
    >
      <button {...attributes} {...listeners} className="text-white/20 hover:text-[#D4AF37] cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{service.title}</span>
          <span className="text-[#D4AF37]/50 text-[10px] border border-[rgba(212,175,55,0.2)] rounded-full px-2 uppercase tracking-wider">{service.tag}</span>
          {!service.is_active && <span className="text-white/25 text-[10px] border border-white/10 rounded-full px-2">hidden</span>}
        </div>
        <p className="text-white/30 text-xs mt-0.5 truncate">{service.description}</p>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onToggle(service)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${service.is_active ? "text-green-400 hover:bg-red-500/10 hover:text-red-400" : "text-white/25 hover:text-green-400 hover:bg-green-500/10"}`}>
          {service.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(service)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(service)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ServicesAdmin() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof emptyForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let id = editId;
    if (editId) {
      await supabase.from("services").update(form).eq("id", editId);
    } else {
      const { data } = await supabase.from("services").insert([{ ...form, sort_order: services.length + 1 }]).select().maybeSingle();
      id = data?.id;
    }
    await logActivity(editId ? "updated" : "created", "service", id || "new", form.title);
    toast({ title: editId ? "Service updated" : "Service added" });
    setShowForm(false); setEditId(null); setForm(emptyForm); setSaving(false); load();
  };

  const handleEdit = (s: Service) => {
    setEditId(s.id);
    setForm({ icon: s.icon, title: s.title, description: s.description || "", tag: s.tag || "", link_href: s.link_href || "/#services", is_active: s.is_active });
    setShowForm(true);
  };

  const handleToggle = async (s: Service) => {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    load();
  };

  const handleDelete = async (s: Service) => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    await supabase.from("services").delete().eq("id", s.id);
    await logActivity("deleted", "service", s.id, s.title);
    toast({ title: "Deleted" });
    load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(services, oldIndex, newIndex);
    setServices(newOrder);
    await Promise.all(newOrder.map((s, i) => supabase.from("services").update({ sort_order: i + 1 }).eq("id", s.id)));
  };

  const SelectedIcon = getIcon(form.icon);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Services Manager</h1>
            <p className="text-white/40 text-sm mt-0.5">{services.length} services — drag to reorder</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 border border-[rgba(212,175,55,0.2)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{editId ? "Edit" : "Add"} Service</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Icon picker */}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Icon</label>
                  <div className="relative">
                    <button type="button" onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm hover:border-[#D4AF37]/50 transition-all">
                      <SelectedIcon className="w-5 h-5 text-[#D4AF37]" />
                      <span>{form.icon}</span>
                    </button>
                    {showIconPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-xl p-3 grid grid-cols-6 gap-2 z-10 shadow-luxury">
                        {ICON_OPTIONS.map(({ name, component: Ic }) => (
                          <button key={name} type="button" title={name}
                            onClick={() => { set("icon", name); setShowIconPicker(false); }}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${form.icon === name ? "bg-[rgba(212,175,55,0.2)] text-[#D4AF37]" : "text-white/40 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)]"}`}>
                            <Ic className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Tag</label>
                  <input value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="e.g. Creative"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Title *</label>
                  <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Service title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Brief service description"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 resize-none" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Link URL</label>
                  <input value={form.link_href} onChange={(e) => set("link_href", e.target.value)} placeholder="/#services"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                  <label htmlFor="is_active" className="text-white/60 text-sm">Active (visible on site)</label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : editId ? "Update" : "Add Service"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-white/15 text-white/60 px-5 py-2.5 rounded-full hover:border-white/30 hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sortable List */}
        {loading ? (
          <div className="text-center py-12 text-white/30">Loading services…</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {services.map((service) => (
                  <SortableServiceRow
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}
