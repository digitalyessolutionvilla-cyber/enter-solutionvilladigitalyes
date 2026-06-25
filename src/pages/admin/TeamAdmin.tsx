import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";
import ImagePicker from "@/components/admin/ImagePicker";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  photo_url: string | null;
  sort_order: number;
}

const defaultForm = { name: "", position: "", department: "General", bio: "", photo_url: "", linkedin: "", twitter: "", status: "active" };
const departments = ["Leadership", "Technology", "Design", "Marketing", "Events", "General"];

// ── Sortable Card ──────────────────────────────────────────
function SortableCard({ member, onEdit, onDelete, isSuperAdmin, loadingEdit }: {
  member: TeamMember;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSuperAdmin: boolean;
  loadingEdit: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-card rounded-2xl p-5 text-center relative group">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/8 cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <img
        src={member.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=D4AF37&color=0A0A0A`}
        alt={member.name}
        className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[rgba(212,175,55,0.4)]"
      />
      <p className="text-white font-bold text-sm">{member.name}</p>
      <p className="text-[#F5D76E] text-xs mt-0.5">{member.position}</p>
      <p className="text-white/40 text-xs mt-0.5">{member.department}</p>

      <div className="flex gap-1.5 justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(member.id)}
          disabled={loadingEdit}
          className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-colors disabled:opacity-40"
        >
          <Pencil className="w-3 h-3" />
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => onDelete(member.id)}
            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-red-400 hover:bg-[rgba(255,77,106,0.2)] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function TeamAdmin() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("team_members")
      .select("id, name, position, department, status, photo_url, sort_order")
      .order("sort_order");
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(members, oldIndex, newIndex);
    setMembers(reordered);

    // Persist sort_order
    const updates = reordered.map((m, i) => supabase.from("team_members").update({ sort_order: i }).eq("id", m.id));
    await Promise.all(updates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = editingId
      ? await supabase.from("team_members").update(form).eq("id", editingId)
      : await supabase.from("team_members").insert([{ ...form, sort_order: members.length }]);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity(editingId ? "updated" : "created", "team_member", editingId || "new", form.name);
    toast({ title: editingId ? "Member updated" : "Member added" });
    setShowForm(false); setEditingId(null); setForm(defaultForm); load();
  };

  const handleEdit = async (memberId: string) => {
    setLoadingEdit(true);
    const { data } = await supabase.from("team_members").select("*").eq("id", memberId).maybeSingle();
    setLoadingEdit(false);
    if (!data) return;
    setEditingId(data.id);
    setForm({
      name: data.name ?? "",
      position: data.position ?? "",
      department: data.department ?? "General",
      bio: data.bio ?? "",
      photo_url: data.photo_url ?? "",
      linkedin: data.linkedin ?? "",
      twitter: data.twitter ?? "",
      status: data.status ?? "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    await logActivity("deleted", "team_member", id, "Team Member");
    toast({ title: "Member removed" }); load();
  };

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Team Members</h1>
            <p className="text-white/35 text-xs mt-0.5">Drag cards to reorder display order</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">{editingId ? "Edit Member" : "Add Team Member"}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Full Name *</label>
                    <input required value={form.name} onChange={(e) => f("name", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Position *</label>
                    <input required value={form.position} onChange={(e) => f("position", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Department</label>
                    <select value={form.department} onChange={(e) => f("department", e.target.value)} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all">
                      {departments.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <ImagePicker label="Photo" value={form.photo_url} onChange={(url) => f("photo_url", url)} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">LinkedIn URL</label>
                    <input value={form.linkedin} onChange={(e) => f("linkedin", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Twitter URL</label>
                    <input value={form.twitter} onChange={(e) => f("twitter", e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all" placeholder="https://twitter.com/..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Bio</label>
                    <textarea value={form.bio} onChange={(e) => f("bio", e.target.value)} rows={3} className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all resize-none" placeholder="Brief biography..." />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase mb-1 block">Status</label>
                    <select value={form.status} onChange={(e) => f("status", e.target.value)} className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 gradient-brand text-[#0A0A0A] font-bold py-2.5 rounded-full btn-glow disabled:opacity-60">
                    {saving ? "Saving..." : editingId ? "Update" : "Add Member"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }} className="px-6 border border-white/20 text-white/70 font-medium py-2.5 rounded-full hover:border-white/40 transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Drag-and-drop grid */}
        {loading ? (
          <div className="text-center text-white/40 py-12">Loading...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-white/40 py-12">No team members yet.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={members.map((m) => m.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {members.map((m) => (
                  <SortableCard
                    key={m.id}
                    member={m}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSuperAdmin={isSuperAdmin}
                    loadingEdit={loadingEdit}
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
