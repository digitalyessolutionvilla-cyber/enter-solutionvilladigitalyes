import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Calendar } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function Inquiries() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    setInquiries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    toast({ title: `Status updated to ${status}` });
    setSelected(selected ? { ...selected, status } : null);
    load();
  };

  const statusColor = (s: string) =>
    s === "new" ? "text-[#00E5FF] border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.1)]" :
    s === "read" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
    "text-green-400 border-green-400/30 bg-green-400/10";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-white font-black text-2xl">Contact Inquiries</h1>

        <div className="bg-[#0A2540] border border-white/8 rounded-2xl overflow-hidden">
          {loading ? <div className="p-12 text-center text-white/40">Loading...</div> :
           inquiries.length === 0 ? <div className="p-12 text-center text-white/40">No inquiries yet.</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-white/8 bg-black/20">
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Subject</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Date</th>
              </tr></thead>
              <tbody>{inquiries.map((inq, i) => (
                <tr key={inq.id} onClick={() => setSelected(inq)} className={`border-b border-white/5 hover:bg-white/4 transition-colors cursor-pointer ${i === inquiries.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3 text-white text-sm font-medium">{inq.name}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden md:table-cell">{inq.email}</td>
                  <td className="px-4 py-3 text-white/55 text-sm hidden sm:table-cell">{inq.subject ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor(inq.status)}`}>{inq.status}</span></td>
                  <td className="px-4 py-3 text-white/40 text-xs text-right">{new Date(inq.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0A2540] border border-white/15 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-xl">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-2xl leading-none transition-colors">×</button>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-white/60 text-sm"><Mail className="w-4 h-4 text-[#00E5FF]" />{selected.email}</div>
                {selected.phone && <div className="flex items-center gap-2 text-white/60 text-sm"><Phone className="w-4 h-4 text-[#00E5FF]" />{selected.phone}</div>}
                <div className="flex items-center gap-2 text-white/60 text-sm"><Calendar className="w-4 h-4 text-[#00E5FF]" />{new Date(selected.created_at).toLocaleString()}</div>
                {selected.subject && <p className="text-[#00E5FF] text-sm font-semibold">{selected.subject}</p>}
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-5">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="flex gap-2">
                {["new", "read", "replied"].map((s) => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-all ${selected.status === s ? "gradient-brand text-white shadow-glow" : "border border-white/20 text-white/55 hover:border-white/40"}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
