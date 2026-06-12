import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff, Image } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
  page_path: string;
}

const emptyForm = { title: "", subtitle: "", image_url: "", cta_text: "Learn More", cta_href: "/contact", is_active: true, page_path: "/" };

const pageOptions = [
  { value: "/", label: "Home Page" },
  { value: "/about", label: "About Page" },
  { value: "/portfolio", label: "Portfolio Page" },
  { value: "/case-studies", label: "Case Studies" },
  { value: "/blog", label: "Blog Page" },
  { value: "/contact", label: "Contact Page" },
];

function SortableSlideRow({ slide, onEdit, onToggle, onDelete }: {
  slide: HeroSlide;
  onEdit: (s: HeroSlide) => void;
  onToggle: (s: HeroSlide) => void;
  onDelete: (s: HeroSlide) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="glass-card rounded-xl flex items-center gap-4 px-4 py-3 group"
    >
      <button {...attributes} {...listeners} className="text-white/20 hover:text-[#D4AF37] cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
        <GripVertical className="w-5 h-5" />
      </button>
      {slide.image_url ? (
        <img src={slide.image_url} alt={slide.title || "Slide"} className="w-20 h-12 object-cover rounded-lg flex-shrink-0 border border-white/10" />
      ) : (
        <div className="w-20 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Image className="w-5 h-5 text-white/20" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">{slide.title || "Untitled Slide"}</span>
          {!slide.is_active && <span className="text-white/25 text-[10px] border border-white/10 rounded-full px-2 flex-shrink-0">hidden</span>}
        </div>
        <p className="text-white/30 text-xs mt-0.5 truncate">{slide.subtitle || slide.cta_text} <span className="text-[#D4AF37]/40 ml-1">→ {slide.page_path || "/"}</span></p>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onToggle(slide)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${slide.is_active ? "text-green-400 hover:bg-red-500/10 hover:text-red-400" : "text-white/25 hover:text-green-400"}`}>
          {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(slide)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(slide)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function HeroSlidesAdmin() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("hero_slides").select("*").order("sort_order");
    setSlides(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof emptyForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) { toast({ title: "Image URL required", variant: "destructive" }); return; }
    setSaving(true);
    let id = editId;
    if (editId) {
      await supabase.from("hero_slides").update(form).eq("id", editId);
    } else {
      const { data } = await supabase.from("hero_slides").insert([{ ...form, sort_order: slides.length + 1 }]).select().maybeSingle();
      id = data?.id;
    }
    await logActivity(editId ? "updated" : "created", "hero_slide", id || "new", form.title || "Hero Slide");
    toast({ title: editId ? "Slide updated" : "Slide added" });
    setShowForm(false); setEditId(null); setForm(emptyForm); setSaving(false); load();
  };

  const handleEdit = (s: HeroSlide) => {
    setEditId(s.id);
    setForm({ title: s.title || "", subtitle: s.subtitle || "", image_url: s.image_url, cta_text: s.cta_text || "Learn More", cta_href: s.cta_href || "/contact", is_active: s.is_active, page_path: s.page_path || "/" });
    setShowForm(true);
  };

  const handleToggle = async (s: HeroSlide) => {
    await supabase.from("hero_slides").update({ is_active: !s.is_active }).eq("id", s.id);
    load();
  };

  const handleDelete = async (s: HeroSlide) => {
    if (!confirm("Delete this slide?")) return;
    await supabase.from("hero_slides").delete().eq("id", s.id);
    await logActivity("deleted", "hero_slide", s.id, s.title || "Hero Slide");
    toast({ title: "Slide deleted" });
    load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = slides.findIndex((s) => s.id === active.id);
    const newIdx = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(slides, oldIdx, newIdx);
    setSlides(reordered);
    await Promise.all(reordered.map((s, i) => supabase.from("hero_slides").update({ sort_order: i + 1 }).eq("id", s.id)));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Hero Slides</h1>
            <p className="text-white/40 text-sm mt-0.5">{slides.length} slides — drag to reorder</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all">
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>

        {/* Info */}
        <div className="glass-card rounded-xl p-4 border border-[rgba(212,175,55,0.1)] flex items-start gap-3">
          <Image className="w-4 h-4 text-[#D4AF37]/50 flex-shrink-0 mt-0.5" />
          <p className="text-white/30 text-xs leading-relaxed">
            Hero slides are used as background images in the website's hero section. Use high-quality images (1920×1080px recommended). You can paste image URLs from the Media Library.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 border border-[rgba(212,175,55,0.2)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{editId ? "Edit" : "Add"} Slide</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Image URL *</label>
                <input required type="url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)}
                  placeholder="https://… (paste from Media Library or any URL)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Title</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Slide headline"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Slide description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">CTA Button Text</label>
                <input value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} placeholder="Learn More"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">CTA Link</label>
                <input value={form.cta_href} onChange={(e) => set("cta_href", e.target.value)} placeholder="/contact"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/50 text-xs font-semibold uppercase block mb-1.5">Assign to Page</label>
                <select value={form.page_path} onChange={(e) => set("page_path", e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50">
                  {pageOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="slide_active" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                <label htmlFor="slide_active" className="text-white/60 text-sm">Active (show on site)</label>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : editId ? "Update Slide" : "Add Slide"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-white/15 text-white/60 px-5 py-2.5 rounded-full hover:border-white/30 hover:text-white transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Sortable List */}
        {loading ? (
          <div className="text-center py-12 text-white/30">Loading slides…</div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Image className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No slides yet. Add your first slide above.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {slides.map((slide) => (
                  <SortableSlideRow key={slide.id} slide={slide} onEdit={handleEdit} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}
