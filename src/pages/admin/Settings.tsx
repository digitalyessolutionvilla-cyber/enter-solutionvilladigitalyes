import { useCallback, useEffect, useState } from "react";
import { Save, RefreshCw, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activityLog";

interface Setting {
  key: string;
  value: string | null;
  label: string;
  group_name: string;
}

const GROUP_LABELS: Record<string, string> = {
  general: "General",
  contact: "Contact Information",
  social: "Social Media",
  analytics: "Analytics & Tracking",
  advanced: "Advanced",
};

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").order("key");
    setSettings(data ?? []);
    const map: Record<string, string> = {};
    (data ?? []).forEach((s: Setting) => { map[s.key] = s.value ?? ""; });
    setValues(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updates = Object.entries(values).map(([key, value]) =>
      supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key)
    );
    await Promise.all(updates);
    await logActivity("updated", "setting", "site_settings", "Site Settings");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast({ title: "Settings saved", description: "All site settings have been updated." });
  };

  // Group settings
  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    const g = s.group_name || "general";
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  const getInputType = (key: string) => {
    if (key.includes("email")) return "email";
    if (key.includes("url")) return "url";
    if (key.includes("phone") || key.includes("whatsapp")) return "tel";
    if (key.includes("maintenance_mode")) return "checkbox";
    return "text";
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-display font-black text-2xl">Site Settings</h1>
            <p className="text-white/40 text-sm mt-0.5">All changes are saved to the database and apply site-wide</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Saved</span>}
            <button onClick={load} className="w-9 h-9 flex items-center justify-center border border-white/15 rounded-xl text-white/40 hover:text-white hover:border-white/30 transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/30">Loading settings…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {Object.entries(grouped).map(([group, groupSettings]) => (
              <div key={group} className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-base border-b border-white/8 pb-3">
                  {GROUP_LABELS[group] || group}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {groupSettings.map((s) => {
                    const inputType = getInputType(s.key);
                    if (inputType === "checkbox") {
                      return (
                        <div key={s.key} className="md:col-span-2 flex items-center gap-3">
                          <input type="checkbox" id={s.key} checked={values[s.key] === "true"}
                            onChange={(e) => set(s.key, e.target.checked ? "true" : "false")}
                            className="w-4 h-4 accent-[#D4AF37]" />
                          <label htmlFor={s.key} className="text-white/70 text-sm">{s.label}</label>
                        </div>
                      );
                    }
                    const isLong = s.key.includes("address") || s.key.includes("description") || s.key.includes("hours");
                    return (
                      <div key={s.key} className={isLong ? "md:col-span-2" : ""}>
                        <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-1.5">{s.label}</label>
                        {isLong ? (
                          <textarea value={values[s.key] ?? ""} onChange={(e) => set(s.key, e.target.value)} rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50 resize-none" />
                        ) : (
                          <input type={inputType} value={values[s.key] ?? ""} onChange={(e) => set(s.key, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold px-7 py-3 rounded-full btn-glow hover:scale-105 transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save All Settings"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
