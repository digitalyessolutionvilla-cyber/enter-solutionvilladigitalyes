import { useCallback, useEffect, useState } from "react";
import { Search, Save, Globe, ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface SeoRecord {
  id: string;
  page_path: string;
  page_name: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  no_index: boolean;
}

const CHAR_LIMITS = { meta_title: 60, meta_description: 160, og_title: 60, og_description: 200 };

function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value || "").length;
  return (
    <span className={`text-xs tabular-nums ${len > max ? "text-red-400" : len > max * 0.85 ? "text-yellow-400" : "text-white/25"}`}>
      {len}/{max}
    </span>
  );
}

function SeoCard({ record, onSave }: { record: SeoRecord; onSave: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(record);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof SeoRecord, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("seo_settings").update({
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      og_title: form.og_title,
      og_description: form.og_description,
      og_image: form.og_image,
      no_index: form.no_index,
      updated_at: new Date().toISOString(),
    }).eq("id", record.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logActivity("updated", "seo_setting", record.id, record.page_name);
    toast({ title: "SEO updated", description: `${record.page_name} page SEO saved.` });
    onSave();
  };

  const Field = ({ label, field, type = "text", placeholder = "" }: { label: string; field: keyof typeof CHAR_LIMITS; type?: string; placeholder?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wide">{label}</label>
        <CharCount value={form[field] as string || ""} max={CHAR_LIMITS[field]} />
      </div>
      {type === "textarea" ? (
        <textarea value={form[field] as string || ""} onChange={(e) => set(field, e.target.value)} rows={2} placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50 resize-none" />
      ) : (
        <input type="text" value={form[field] as string || ""} onChange={(e) => set(field, e.target.value)} placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50" />
      )}
    </div>
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-sm">{record.page_name}</div>
            <div className="text-white/30 text-xs">{record.page_path}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {form.no_index && <span className="text-red-400 text-xs border border-red-400/25 bg-red-400/10 rounded-full px-2 py-0.5">No Index</span>}
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-white/8 space-y-5 pt-5">
          {/* Preview */}
          <div className="rounded-xl bg-white/3 border border-white/8 p-4">
            <p className="text-[#D4AF37] text-sm font-bold mb-0.5 truncate">{form.meta_title || "Page Title"}</p>
            <p className="text-green-400 text-xs mb-1">{`solutionvilla.com${record.page_path}`}</p>
            <p className="text-white/40 text-xs line-clamp-2">{form.meta_description || "Page description…"}</p>
          </div>

          {/* Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Meta Title" field="meta_title" placeholder="Page Title – Solution Villa" />
            <Field label="OG Title" field="og_title" placeholder="Social share title" />
            <Field label="Meta Description" field="meta_description" type="textarea" placeholder="Page description for search engines (max 160 chars)" />
            <Field label="OG Description" field="og_description" type="textarea" placeholder="Description for social sharing" />
          </div>
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-1.5">OG Image URL</label>
            <input type="url" value={form.og_image || ""} onChange={(e) => set("og_image", e.target.value)}
              placeholder="https://…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id={`noindex-${record.id}`} checked={form.no_index} onChange={(e) => set("no_index", e.target.checked)}
              className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-[#D4AF37]" />
            <label htmlFor={`noindex-${record.id}`} className="text-white/60 text-sm">No Index (hide from search engines)</label>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save SEO Settings"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SeoSettings() {
  const [records, setRecords] = useState<SeoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_settings").select("*").order("page_name");
    setRecords(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) =>
    !search || r.page_name.toLowerCase().includes(search.toLowerCase()) || r.page_path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-display font-black text-2xl">SEO Settings</h1>
            <p className="text-white/40 text-sm mt-0.5">Manage meta tags, OG images, and indexing for each page</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages…"
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50 w-48" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/30">Loading SEO settings…</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => <SeoCard key={r.id} record={r} onSave={load} />)}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
