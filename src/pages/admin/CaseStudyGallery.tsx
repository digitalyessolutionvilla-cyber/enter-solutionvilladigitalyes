import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, X, Upload, GripVertical, ChevronDown } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImagePicker from "@/components/admin/ImagePicker";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
}

interface GalleryImage {
  id: string;
  case_study_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

function SortableImage({ img, onDelete }: { img: GalleryImage; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
      <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center cursor-grab active:cursor-grabbing text-white"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <button
          onClick={() => onDelete(img.id)}
          className="w-8 h-8 rounded-lg bg-red-500/30 flex items-center justify-center text-red-300 hover:bg-red-500/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {img.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-1">
          <p className="text-white/80 text-xs truncate">{img.caption}</p>
        </div>
      )}
    </div>
  );
}

export default function CaseStudyGallery() {
  const { toast } = useToast();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    supabase.from("case_studies").select("id, title, client").order("title").then(({ data }) => setCaseStudies(data ?? []));
  }, []);

  const loadImages = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from("case_study_gallery").select("*").eq("case_study_id", id).order("sort_order");
    setImages(data ?? []);
    setLoading(false);
  };

  const handleSelectStudy = (id: string) => {
    setSelectedId(id);
    if (id) loadImages(id);
    else setImages([]);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIdx, newIdx);
    setImages(reordered);
    await Promise.all(reordered.map((img, i) => supabase.from("case_study_gallery").update({ sort_order: i }).eq("id", img.id)));
  };

  const handleAdd = async () => {
    if (!newImageUrl || !selectedId) return;
    setSaving(true);
    const { error } = await supabase.from("case_study_gallery").insert({
      case_study_id: selectedId,
      image_url: newImageUrl,
      caption: newCaption || null,
      sort_order: images.length,
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Image added" });
    setNewImageUrl(""); setNewCaption(""); setShowAdd(false);
    loadImages(selectedId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image?")) return;
    await supabase.from("case_study_gallery").delete().eq("id", id);
    toast({ title: "Image removed" });
    loadImages(selectedId);
  };

  const selectedStudy = caseStudies.find((c) => c.id === selectedId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Case Study Gallery</h1>
            <p className="text-white/35 text-xs mt-0.5">Manage photo galleries for each case study</p>
          </div>
          {selectedId && (
            <button
              onClick={() => { setShowAdd(true); setNewImageUrl(""); setNewCaption(""); }}
              className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Add Image
            </button>
          )}
        </div>

        {/* Case study selector */}
        <div className="relative">
          <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Select Case Study</label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => handleSelectStudy(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all appearance-none pr-10"
            >
              <option value="">— Select a case study —</option>
              {caseStudies.map((c) => (
                <option key={c.id} value={c.id}>{c.title} · {c.client}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Add image modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Add Gallery Image</h2>
                <button onClick={() => setShowAdd(false)} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <ImagePicker label="Image" value={newImageUrl} onChange={setNewImageUrl} />
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Caption (optional)</label>
                  <input
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Brief description of this image..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleAdd} disabled={!newImageUrl || saving}
                    className="flex-1 gradient-brand text-[#0A0A0A] font-bold py-2.5 rounded-full btn-glow disabled:opacity-60">
                    {saving ? "Adding..." : "Add Image"}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {!selectedId ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <p className="text-white/25 text-sm">Select a case study above to manage its gallery</p>
          </div>
        ) : loading ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <p className="text-white/40 text-sm">Loading gallery...</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white/70 text-sm font-semibold">
                {selectedStudy?.title} — <span className="text-[#D4AF37]/60">{images.length} image{images.length !== 1 ? "s" : ""}</span>
              </h2>
              <p className="text-white/25 text-xs">Drag images to reorder</p>
            </div>
            {images.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border-2 border-dashed border-white/8">
                <Upload className="w-8 h-8 text-white/15 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No images yet. Click "Add Image" to get started.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                      <SortableImage key={img.id} img={img} onDelete={handleDelete} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
