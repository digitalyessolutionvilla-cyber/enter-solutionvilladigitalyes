import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Users, Send, Trash2, UserX, Download,
  Plus, Eye, Search, RefreshCw, CheckCircle, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string;
  created_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sent";
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── Subscribers Tab ──────────────────────────────────────────────────────────

function SubscribersTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Subscriber[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: "active" | "unsubscribed") => {
    await supabase.from("newsletter_subscribers").update({ status }).eq("id", id);
    toast({ title: status === "unsubscribed" ? "Subscriber unsubscribed" : "Subscriber re-activated" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this subscriber permanently?")) return;
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    toast({ title: "Subscriber deleted" });
    load();
  };

  const exportCSV = () => {
    const active = rows.filter((r) => r.status === "active");
    const csv = ["Email,Name,Source,Subscribed At"]
      .concat(active.map((r) => `${r.email},${r.name ?? ""},${r.source},${r.created_at}`))
      .join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = rows.filter(
    (r) => r.email.includes(search) || (r.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const active = rows.filter((r) => r.status === "active").length;
  const unsub = rows.filter((r) => r.status === "unsubscribed").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: rows.length, color: "text-white" },
          { label: "Active", value: active, color: "text-[#F5D76E]" },
          { label: "Unsubscribed", value: unsub, color: "text-white/40" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A1A] border border-white/8 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[rgba(212,175,55,0.4)]"
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-xs font-semibold hover:bg-[rgba(212,175,55,0.07)] transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <button onClick={load} className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Loading subscribers…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No subscribers yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                        <span className="text-[#0A0A0A] text-[10px] font-black">{sub.email[0].toUpperCase()}</span>
                      </div>
                      <span className="text-white text-sm">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/40 text-xs capitalize">{sub.source}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/40 text-xs">{fmtDate(sub.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sub.status === "active"
                        ? "text-[#F5D76E] border-[rgba(245,215,110,0.3)] bg-[rgba(245,215,110,0.08)]"
                        : "text-white/30 border-white/10 bg-white/3"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => updateStatus(sub.id, "unsubscribed")}
                          className="p-1.5 rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/8 transition-all"
                          title="Unsubscribe"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(sub.id, "active")}
                          className="p-1.5 rounded-lg text-white/30 hover:text-green-400 hover:bg-green-400/8 transition-all"
                          title="Re-activate"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => remove(sub.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Campaign Compose Panel ───────────────────────────────────────────────────

interface ComposeProps {
  initial?: Campaign;
  onSaved: () => void;
  onCancel: () => void;
}

function ComposePanel({ initial, onSaved, onCancel }: ComposeProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const save = async (sendNow = false) => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Subject and body are required", variant: "destructive" });
      return;
    }

    if (sendNow) {
      setSending(true);
    } else {
      setSaving(true);
    }

    try {
      let id = initial?.id;
      if (!id) {
        const { data, error } = await supabase
          .from("newsletter_campaigns")
          .insert({ subject: subject.trim(), body: body.trim() })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
      } else {
        await supabase
          .from("newsletter_campaigns")
          .update({ subject: subject.trim(), body: body.trim() })
          .eq("id", id);
      }

      if (sendNow && id) {
        const { data, error } = await supabase.functions.invoke("send-newsletter-campaign", {
          body: { campaignId: id },
        });
        if (error) throw error;
        toast({ title: `Campaign sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}!` });
      } else {
        toast({ title: "Campaign saved as draft" });
      }
      onSaved();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSending(false);
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-base">{initial ? "Edit Campaign" : "New Campaign"}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 border border-white/8 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> {preview ? "Edit" : "Preview"}
          </button>
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/4 transition-all">
            Cancel
          </button>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-white/50 text-xs mb-1.5">Subject Line</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject…"
          className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[rgba(212,175,55,0.4)] transition-colors"
        />
      </div>

      {/* Body */}
      {preview ? (
        <div>
          <label className="block text-white/50 text-xs mb-1.5">Preview</label>
          <div
            className="bg-white rounded-xl p-6 text-[#111] text-sm leading-relaxed min-h-[240px]"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      ) : (
        <div>
          <label className="block text-white/50 text-xs mb-1.5">Email Body <span className="text-white/25">(HTML supported)</span></label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"<h1>Hello!</h1>\n<p>Your message here…</p>"}
            rows={12}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[rgba(212,175,55,0.4)] transition-colors font-mono resize-y"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/6">
        <button
          onClick={() => save(false)}
          disabled={saving || sending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(212,175,55,0.25)] text-[#D4AF37] text-sm font-semibold hover:bg-[rgba(212,175,55,0.07)] transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={sending || saving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg gradient-brand text-[#0A0A0A] text-sm font-bold shadow-glow hover:opacity-90 transition-all disabled:opacity-60"
        >
          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Sending…" : "Send Now"}
        </button>
      </div>
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────────────────────

function CampaignsTab() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await supabase.from("newsletter_campaigns").delete().eq("id", id);
    toast({ title: "Campaign deleted" });
    load();
  };

  const handleSaved = () => {
    setComposing(false);
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        {!composing && !editing && (
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-[#0A0A0A] text-sm font-bold shadow-glow hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Compose / Edit */}
      {composing && (
        <ComposePanel onSaved={handleSaved} onCancel={() => setComposing(false)} />
      )}
      {editing && (
        <ComposePanel initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
      )}

      {/* List */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Loading campaigns…</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-sm">No campaigns yet. Create your first one above.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Recipients</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.12)] flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                      </div>
                      <span className="text-white text-sm font-medium line-clamp-1">{c.subject}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === "sent"
                        ? "text-green-400 border-green-400/30 bg-green-400/8"
                        : "text-[#F5D76E] border-[rgba(245,215,110,0.3)] bg-[rgba(245,215,110,0.08)]"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/50 text-sm">{c.recipient_count > 0 ? `${c.recipient_count} sent` : "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/40 text-xs">
                      {c.sent_at ? fmtDate(c.sent_at) : fmtDate(c.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status === "draft" && (
                        <button
                          onClick={() => { setComposing(false); setEditing(c); }}
                          className="p-1.5 rounded-lg text-white/30 hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all"
                          title="Edit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => remove(c.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewsletterAdmin() {
  const [tab, setTab] = useState<"subscribers" | "campaigns">("subscribers");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-glow">
            <Mail className="w-5 h-5 text-[#0A0A0A]" />
          </div>
          <div>
            <h1 className="text-white font-black text-2xl">Newsletter</h1>
            <p className="text-white/35 text-sm">Manage subscribers and send campaigns</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-white/8 rounded-xl p-1 w-fit">
          {(["subscribers", "campaigns"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                tab === t
                  ? "bg-[rgba(212,175,55,0.1)] text-[#F5D76E] border border-[rgba(212,175,55,0.15)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "subscribers" ? <Users className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "subscribers" ? <SubscribersTab /> : <CampaignsTab />}
      </div>
    </AdminLayout>
  );
}
