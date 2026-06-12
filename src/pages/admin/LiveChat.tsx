import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Send, User, MessageSquare, RefreshCw, ChevronRight, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  visitor_company: string | null;
  status: string;
  page_url: string | null;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  admin_name: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  active:  { label: "Active",           cls: "text-green-400 bg-green-400/10 border-green-400/25" },
  waiting: { label: "Waiting for Agent",cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25" },
  taken:   { label: "In Progress",      cls: "text-blue-400 bg-blue-400/10 border-blue-400/25" },
  closed:  { label: "Closed",           cls: "text-white/25 bg-white/4 border-white/10" },
  missed:  { label: "Missed",           cls: "text-red-400 bg-red-400/10 border-red-400/25" },
};

export default function LiveChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const selectedConv = conversations.find((c) => c.id === selected);

  const loadConversations = async () => {
    setLoading(true);
    const { data } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
    setLoading(false);
  };

  useEffect(() => { loadConversations(); }, []);

  // Realtime conversations
  useEffect(() => {
    const ch = supabase.channel("admin-convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, loadConversations)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Load messages for selected conv
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    supabase.from("chat_messages").select("*").eq("conversation_id", selected).order("created_at")
      .then(({ data }) => { if (data) setMessages(data as Message[]); });
  }, [selected]);

  // Realtime messages
  useEffect(() => {
    if (!selected) return;
    const ch = supabase.channel(`admin-msgs-${selected}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${selected}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSelect = async (id: string) => {
    setSelected(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv?.status === "waiting" || conv?.status === "active") {
      await supabase.from("chat_conversations").update({ status: "taken" }).eq("id", id);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      conversation_id: selected,
      role: "admin",
      content: reply.trim(),
      admin_name: profile?.full_name || "Support Agent",
    });
    setReply("");
    setSending(false);
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    await supabase.from("chat_conversations").update({ status }).eq("id", selected);
    setConversations((prev) => prev.map((c) => c.id === selected ? { ...c, status } : c));
  };

  const filtered = conversations.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.visitor_name?.toLowerCase().includes(q) || c.visitor_email?.toLowerCase().includes(q) || c.session_id?.includes(q);
    }
    return true;
  });

  const waitingCount = conversations.filter((c) => c.status === "waiting").length;

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-130px)] rounded-2xl overflow-hidden border border-[rgba(212,175,55,0.08)] bg-[#0D0D0D]">

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r border-[rgba(212,175,55,0.08)]">
          <div className="p-4 border-b border-[rgba(212,175,55,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-sm">Conversations</h2>
              <div className="flex items-center gap-2">
                {waitingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/25">
                    {waitingCount} waiting
                  </span>
                )}
                <button onClick={loadConversations} className="text-white/20 hover:text-white/60 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none focus:border-[#D4AF37]/25" />
            </div>
            <div className="flex flex-wrap gap-1">
              {["all", "waiting", "taken", "active", "closed"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all capitalize",
                    statusFilter === s ? "bg-[rgba(212,175,55,0.1)] text-[#F5D76E] border-[rgba(212,175,55,0.3)]" : "text-white/25 border-white/8 hover:text-white/50")}>
                  {s === "all" ? "All" : STATUS[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-white/25 text-xs p-4">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-white/20 text-xs p-4">No conversations</p>
            ) : filtered.map((conv) => {
              const st = STATUS[conv.status] || STATUS.active;
              return (
                <button key={conv.id} onClick={() => handleSelect(conv.id)}
                  className={cn("w-full text-left px-4 py-3 border-b border-white/4 transition-all hover:bg-white/2",
                    selected === conv.id && "bg-[rgba(212,175,55,0.04)] border-l-2 border-l-[#D4AF37]")}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)] flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-[#D4AF37]/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white/80 text-xs font-medium truncate">{conv.visitor_name || "Anonymous"}</p>
                      <p className="text-white/25 text-[10px] truncate">{conv.visitor_email || `Session ${conv.session_id?.slice(0, 8)}`}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-white/12 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", st.cls)}>{st.label}</span>
                    <span className="text-white/18 text-[10px]">{new Date(conv.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-white/8 mx-auto mb-3" />
                <p className="text-white/25 text-sm">Select a conversation to respond</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conv header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-[rgba(212,175,55,0.08)] flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold text-sm">{selectedConv?.visitor_name || "Anonymous Visitor"}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    {selectedConv?.visitor_email && <span className="text-white/30 text-[11px]">{selectedConv.visitor_email}</span>}
                    {selectedConv?.visitor_phone && <span className="text-white/30 text-[11px]">{selectedConv.visitor_phone}</span>}
                    {selectedConv?.page_url && <span className="text-white/20 text-[11px]">Page: {selectedConv.page_url}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {["active", "taken", "closed", "missed"].map((s) => (
                    <button key={s} onClick={() => updateStatus(s)}
                      className={cn("px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all",
                        selectedConv?.status === s ? cn(STATUS[s]?.cls, "border-current") : "text-white/25 border-white/8 hover:text-white/55")}>
                      {STATUS[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.map((msg) => {
                  const isAdmin = msg.role === "admin";
                  const isAI = msg.role === "assistant";
                  return (
                    <div key={msg.id} className={cn("flex gap-2.5", isAdmin ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        isAdmin ? "bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]" :
                        isAI ? "bg-purple-500/12 border border-purple-400/25" : "bg-white/8 border border-white/12")}>
                        <User className={cn("w-3 h-3", isAdmin ? "text-[#D4AF37]" : isAI ? "text-purple-400" : "text-white/40")} />
                      </div>
                      <div className={cn("max-w-[70%] flex flex-col gap-1", isAdmin ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/25">
                            {isAdmin ? (msg.admin_name || "Agent") : isAI ? "SOLUTION AI" : "Visitor"}
                          </span>
                          <span className="text-[10px] text-white/12">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className={cn("px-3.5 py-2.5 rounded-xl text-sm text-white/80 leading-relaxed",
                          isAdmin ? "bg-[rgba(212,175,55,0.07)] border border-[rgba(212,175,55,0.12)] rounded-tr-sm" :
                          isAI ? "bg-purple-500/7 border border-purple-400/12 rounded-tl-sm" :
                          "bg-white/4 border border-white/7 rounded-tl-sm")}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-[rgba(212,175,55,0.08)]">
                <div className="flex items-center gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }}}
                    placeholder="Type your reply... (Enter to send)"
                    className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-[#D4AF37]/25 transition-all" />
                  <button onClick={sendReply} disabled={!reply.trim() || sending}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#D4AF37,#B8932A)" }}>
                    <Send className="w-4 h-4 text-[#0A0A0A]" />
                  </button>
                </div>
                <p className="text-white/15 text-[10px] mt-1.5 px-1">
                  Replying as <span className="text-[#D4AF37]/40">{profile?.full_name || "Admin"}</span> · Your replies appear live in the visitor's chat
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
