import { useCallback, useEffect, useState } from "react";
import { Save, ExternalLink, Layout, RefreshCw, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface PageSection {
  id: string;
  page_path: string;
  section_key: string;
  section_label: string;
  content: Record<string, unknown>;
  updated_at: string;
}

const PAGE_GROUPS = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About Page" },
];

// Type-safe text editor for JSON content
function ContentEditor({ section, onSaved }: { section: PageSection; onSaved: () => void }) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const flat: Record<string, string> = {};
    const flatten = (obj: unknown, prefix = "") => {
      if (Array.isArray(obj)) {
        obj.forEach((item, i) => flatten(item, prefix ? `${prefix}[${i}]` : `[${i}]`));
      } else if (obj && typeof obj === "object") {
        Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
          flatten(v, prefix ? `${prefix}.${k}` : k);
        });
      } else {
        flat[prefix] = String(obj ?? "");
      }
    };
    flatten(section.content);
    setValues(flat);
  }, [section]);

  const unflatten = (flat: Record<string, string>): unknown => {
    // For our simple case, rebuild the object from dot-notation keys
    const result: Record<string, unknown> = {};
    // Check if it's an array-type section (stats)
    const isArray = Object.keys(flat).some((k) => k.startsWith("["));
    if (isArray) {
      const arr: Record<string, unknown>[] = [];
      Object.entries(flat).forEach(([k, v]) => {
        const idxMatch = k.match(/^\[(\d+)\]\.(.+)$/);
        if (idxMatch) {
          const idx = parseInt(idxMatch[1]);
          const field = idxMatch[2];
          if (!arr[idx]) arr[idx] = {};
          (arr[idx] as Record<string, unknown>)[field] = isNaN(Number(v)) ? v : Number(v);
        }
      });
      return arr;
    }
    Object.entries(flat).forEach(([k, v]) => {
      result[k] = isNaN(Number(v)) || v === "" ? v : (result[k] !== undefined ? v : v);
    });
    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    const content = unflatten(values);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("page_sections").update({
      content,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    }).eq("id", section.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity("updated", "page_section", section.id, section.section_label);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast({ title: "Content saved", description: `${section.section_label} updated.` });
    onSaved();
  };

  const labelFor = (key: string) => {
    const last = key.split(".").pop() || key;
    return last.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isTextArea = (key: string) => {
    const k = key.toLowerCase();
    return k.includes("description") || k.includes("mission") || k.includes("vision") || k.includes("bio") || k.includes("excerpt");
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">{section.section_label}</h3>
          <p className="text-white/30 text-xs mt-0.5">Last updated: {new Date(section.updated_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-4 py-2 rounded-full btn-glow text-sm disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className={isTextArea(key) ? "md:col-span-2" : ""}>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wide block mb-1.5">{labelFor(key)}</label>
            {isTextArea(key) ? (
              <textarea value={value} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 resize-none" />
            ) : (
              <input type="text" value={value} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageEditor() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("/");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("page_sections").select("*").order("section_key");
    setSections((data as PageSection[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pageSections = sections.filter((s) => s.page_path === activePage);
  const activePageLabel = PAGE_GROUPS.find((p) => p.path === activePage)?.label ?? "Page";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Page Content Editor</h1>
            <p className="text-white/40 text-sm mt-0.5">Edit text content for each page section</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 flex items-center justify-center border border-white/15 rounded-xl text-white/40 hover:text-white hover:border-white/30 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href={activePage} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[rgba(212,175,55,0.1)] transition-all">
              <ExternalLink className="w-4 h-4" /> Preview Page
            </a>
          </div>
        </div>

        {/* Page selector */}
        <div className="flex gap-2 flex-wrap">
          {PAGE_GROUPS.map((pg) => (
            <button key={pg.path} onClick={() => setActivePage(pg.path)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activePage === pg.path ? "gradient-brand text-[#0A0A0A] shadow-glow" : "border border-white/15 text-white/50 hover:border-[rgba(212,175,55,0.3)] hover:text-white"}`}>
              <Layout className="w-4 h-4" /> {pg.label}
            </button>
          ))}
        </div>

        {/* Sections for selected page */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Loading content…</div>
        ) : pageSections.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Layout className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No editable sections found for {activePageLabel}</p>
            <p className="text-white/20 text-xs mt-1">Sections are seeded in the database during setup.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-white font-bold">{activePageLabel}</h2>
              <span className="text-white/30 text-xs">— {pageSections.length} section{pageSections.length !== 1 ? "s" : ""}</span>
            </div>
            {pageSections.map((section) => (
              <ContentEditor key={section.id} section={section} onSaved={load} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
