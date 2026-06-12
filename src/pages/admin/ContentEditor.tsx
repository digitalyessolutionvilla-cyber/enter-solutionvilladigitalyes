import { useCallback, useEffect, useState } from "react";
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, RotateCcw, Check, Home, Info, Briefcase, BookOpen, FileText, Phone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

// ── Types ─────────────────────────────────────────────
interface PageSection {
  id: string;
  page_path: string;
  section_key: string;
  section_label: string;
  content: Record<string, unknown>;
}

const PAGES = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About Us", icon: Info },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/case-studies", label: "Case Studies", icon: FileText },
  { path: "/blog", label: "Blog", icon: BookOpen },
  { path: "/team", label: "Team", icon: Eye },
  { path: "/contact", label: "Contact", icon: Phone },
];

// ── Field renderers ────────────────────────────────────
function TextField({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (f: string, v: unknown) => void }) {
  return (
    <div>
      <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all"
      />
    </div>
  );
}

function TextAreaField({ label, field, value, onChange, rows = 3 }: { label: string; field: string; value: string; onChange: (f: string, v: unknown) => void; rows?: number }) {
  return (
    <div>
      <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 resize-none transition-all"
      />
    </div>
  );
}

function UrlField({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (f: string, v: unknown) => void }) {
  return (
    <div>
      <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider block mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder="/path or https://…"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 font-mono transition-all"
      />
    </div>
  );
}

function StringListField({ label, field, value, onChange }: { label: string; field: string; value: string[]; onChange: (f: string, v: unknown) => void }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx: number, v: string) => {
    const next = [...items]; next[idx] = v; onChange(field, next);
  };
  const add = () => onChange(field, [...items, ""]);
  const remove = (idx: number) => onChange(field, items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</label>
        <button type="button" onClick={add} className="text-[#D4AF37] text-[10px] hover:text-[#F5D76E] flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              placeholder={`Item ${idx + 1}`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]/50"
            />
            <button type="button" onClick={() => remove(idx)} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/20 text-xs italic">No items — click Add</p>}
      </div>
    </div>
  );
}

function ObjectListField({ label, field, value, onChange, fields }: {
  label: string; field: string; value: Record<string, string>[]; onChange: (f: string, v: unknown) => void;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
}) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx: number, k: string, v: string) => {
    const next = items.map((item, i) => i === idx ? { ...item, [k]: v } : item);
    onChange(field, next);
  };
  const add = () => onChange(field, [...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  const remove = (idx: number) => onChange(field, items.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const n = [...items];
    [n[idx], n[idx + dir]] = [n[idx + dir], n[idx]];
    onChange(field, n);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</label>
        <button type="button" onClick={add} className="text-[#D4AF37] text-[10px] hover:text-[#F5D76E] flex items-center gap-0.5">
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-xs">Item {idx + 1}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-white/20 hover:text-white/50 disabled:opacity-20">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-white/20 hover:text-white/50 disabled:opacity-20">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => remove(idx)} className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {fields.map((f) => f.multiline ? (
                <div key={f.key} className="sm:col-span-2">
                  <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">{f.label}</label>
                  <textarea
                    rows={2}
                    value={item[f.key] || ""}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#D4AF37]/50 resize-none"
                  />
                </div>
              ) : (
                <div key={f.key}>
                  <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">{f.label}</label>
                  <input
                    value={item[f.key] || ""}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/20 text-xs italic">No items — click Add Item</p>}
      </div>
    </div>
  );
}

// ── Section Editor ─────────────────────────────────────
function renderField(key: string, value: unknown, onChange: (k: string, v: unknown) => void) {
  // Boolean fields
  if (key === "is_visible") {
    return (
      <div key={key} className="flex items-center gap-3">
        <input type="checkbox" id={key} checked={Boolean(value)} onChange={(e) => onChange(key, e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
        <label htmlFor={key} className="text-white/60 text-sm">Section visible on site</label>
      </div>
    );
  }

  // Keywords / badges as string list
  if ((key === "keywords" || key === "badges") && Array.isArray(value)) {
    return <StringListField key={key} label={key === "keywords" ? "Keywords (rotating)" : "Badges"} field={key} value={value as string[]} onChange={onChange} />;
  }

  // Stats array
  if (key === "stats" || (Array.isArray(value) && (value as Record<string, unknown>[])[0]?.label)) {
    return (
      <ObjectListField key={key} label={formatLabel(key)} field={key} value={value as Record<string, string>[]} onChange={onChange}
        fields={[
          { key: "label", label: "Label" },
          { key: "value", label: "Number" },
          { key: "suffix", label: "Suffix (e.g. +, %)" },
        ]}
      />
    );
  }

  // Values / features array with icon
  if (Array.isArray(value) && (value as Record<string, unknown>[])[0]?.icon) {
    return (
      <ObjectListField key={key} label={formatLabel(key)} field={key} value={value as Record<string, string>[]} onChange={onChange}
        fields={[
          { key: "icon", label: "Icon Name (Lucide)" },
          { key: "title", label: "Title" },
          { key: "desc", label: "Description", multiline: true },
        ]}
      />
    );
  }

  // Timeline array
  if (Array.isArray(value) && (value as Record<string, unknown>[])[0]?.year) {
    return (
      <ObjectListField key={key} label={formatLabel(key)} field={key} value={value as Record<string, string>[]} onChange={onChange}
        fields={[
          { key: "year", label: "Year" },
          { key: "title", label: "Title" },
          { key: "desc", label: "Description", multiline: true },
        ]}
      />
    );
  }

  // Generic arrays of objects
  if (Array.isArray(value) && value.length > 0 && typeof (value as unknown[])[0] === "object") {
    const sample = (value as Record<string, unknown>[])[0];
    const fieldDefs = Object.keys(sample).map((k) => ({ key: k, label: formatLabel(k), multiline: String(sample[k]).length > 60 }));
    return (
      <ObjectListField key={key} label={formatLabel(key)} field={key} value={value as Record<string, string>[]} onChange={onChange} fields={fieldDefs} />
    );
  }

  // URL-like fields
  if (key.includes("href") || key.includes("url") || key.includes("link")) {
    return <UrlField key={key} label={formatLabel(key)} field={key} value={String(value ?? "")} onChange={onChange} />;
  }

  // Long text fields
  const strVal = String(value ?? "");
  if (key.includes("text") || key.includes("subtitle") || key.includes("description") || key.includes("bio") || strVal.length > 80) {
    return <TextAreaField key={key} label={formatLabel(key)} field={key} value={strVal} onChange={onChange} />;
  }

  // Default: short text
  return <TextField key={key} label={formatLabel(key)} field={key} value={strVal} onChange={onChange} />;
}

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SectionCard({ section, onSave }: { section: PageSection; onSave: (id: string, content: Record<string, unknown>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(section.content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isVisible = draft.is_visible !== false;

  const handleChange = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(section.id, draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => setDraft(section.content);

  return (
    <div className={`glass-card rounded-2xl overflow-hidden border transition-all duration-200 ${open ? "border-[rgba(212,175,55,0.25)]" : "border-white/5 hover:border-white/10"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isVisible ? "bg-green-500" : "bg-white/20"}`} />
          <div>
            <span className="text-white text-sm font-semibold">{section.section_label}</span>
            <span className="text-white/25 text-xs ml-2 font-mono">{section.section_key}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isVisible && <span className="text-white/25 text-[10px] border border-white/10 rounded-full px-2">hidden</span>}
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="pt-5 space-y-4">
            {Object.entries(draft).map(([k, v]) => renderField(k, v, handleChange))}

            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-5 py-2 rounded-full btn-glow text-sm disabled:opacity-50 transition-all"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved!" : saving ? "Saving…" : "Save Section"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 border border-white/10 text-white/40 hover:text-white hover:border-white/25 px-4 py-2 rounded-full text-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ContentEditor() {
  const { toast } = useToast();
  const [activePage, setActivePage] = useState("/");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSections = useCallback(async (path: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_path", path)
      .order("id");
    setSections((data ?? []) as PageSection[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadSections(activePage); }, [activePage, loadSections]);

  const handleSave = async (id: string, content: Record<string, unknown>) => {
    const { error } = await supabase.from("page_sections").update({ content }).eq("id", id);
    if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); return; }
    const section = sections.find((s) => s.id === id);
    await logActivity("updated", "page_section", id, section?.section_label || id);
    // Update local state
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, content } : s));
    toast({ title: "Section saved", description: `"${section?.section_label}" updated successfully.` });
  };

  const activeMeta = PAGES.find((p) => p.path === activePage);
  const PageIcon = activeMeta?.icon || Home;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-white font-display font-black text-2xl">Content Editor</h1>
          <p className="text-white/40 text-sm mt-0.5">Edit every section of every page from one place</p>
        </div>

        {/* Page Tabs */}
        <div className="flex flex-wrap gap-2">
          {PAGES.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => setActivePage(path)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activePage === path
                  ? "gradient-brand text-[#0A0A0A] font-bold shadow-glow"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/8 border border-white/8"
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Live preview link */}
        <div className="flex items-center gap-3">
          <a
            href={activePage === "/" ? "/" : activePage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[#D4AF37]/60 text-xs hover:text-[#D4AF37] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview <PageIcon className="w-3 h-3" /> {activeMeta?.label} page →
          </a>
          <span className="text-white/15 text-xs">(opens in new tab)</span>
        </div>

        {/* Sections */}
        {loading ? (
          <div className="text-center py-16 text-white/30 text-sm">Loading sections…</div>
        ) : sections.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <EyeOff className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No editable sections found for this page yet.</p>
            <p className="text-white/20 text-xs mt-1">Sections will appear here automatically once the page data is in the database.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
