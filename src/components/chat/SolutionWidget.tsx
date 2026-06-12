import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Minimize2, RefreshCw, User, Phone, Mail, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SolutionAvatar from "./SolutionAvatar";

const SUPABASE_URL = "https://spb-t4nxv154wkw82b31.supabase.opentrust.net";
const SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG54djE1NHdrdzgyYjMxIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODA3MzQ3NjMsImV4cCI6MjA5NjMxMDc2M30.xhplfZsmB-bQukyhcrQXN8InavgxWfz2r_p7AC756vc";

interface Message {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  timestamp: Date;
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content: "Hello 👋 I am Solution, your digital assistant at Solution Villa. I'm here to help you explore our services, answer your questions, and connect you with our team. How can I help you today?",
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  { label: "Our Services", text: "What services does Solution Villa offer?" },
  { label: "Get a Quote", text: "I'd like to get a quote for a project" },
  { label: "Talk to Human", text: "I want to speak to a human representative" },
  { label: "Our Portfolio", text: "Can you show me your portfolio?" },
];

function extractLeadData(content: string, existing: LeadData): Partial<LeadData> {
  const updates: Partial<LeadData> = {};
  const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch && !existing.email) updates.email = emailMatch[0];
  const phoneMatch = content.match(/(\+?[\d\s\-().]{10,})/);
  if (phoneMatch && !existing.phone) updates.phone = phoneMatch[0].trim();
  return updates;
}

export default function SolutionWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [avatarState, setAvatarState] = useState<"idle" | "thinking" | "speaking" | "greeting">("idle");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [handedOver, setHandedOver] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("sv_session_id");
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem("sv_session_id", id);
    return id;
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Restore session
  useEffect(() => {
    const storedConvId = localStorage.getItem("sv_conversation_id");
    if (storedConvId) {
      setConversationId(storedConvId);
      supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", storedConvId)
        .order("created_at")
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMessages([
              GREETING,
              ...data.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant" | "admin",
                content: m.content,
                timestamp: new Date(m.created_at),
              })),
            ]);
          }
        });
    }
  }, []);

  // Real-time admin messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-visitor-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as { id: string; role: string; content: string; created_at: string };
        if (msg.role === "admin") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { id: msg.id, role: "admin", content: msg.content, timestamp: new Date(msg.created_at) }];
          });
          if (!open) setUnread((u) => u + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, open]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    if (!hasOpened) {
      setHasOpened(true);
      setAvatarState("greeting");
      setTimeout(() => setAvatarState("idle"), 1500);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const createConversation = useCallback(async () => {
    const { data, error } = await supabase.from("chat_conversations").insert({
      session_id: sessionId,
      page_url: window.location.pathname,
      status: "active",
    }).select("id").single();
    if (!error && data) {
      setConversationId(data.id);
      localStorage.setItem("sv_conversation_id", data.id);
      return data.id;
    }
    return null;
  }, [sessionId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setAvatarState("thinking");

    const extracted = extractLeadData(text, leadData);
    const updatedLead = { ...leadData, ...extracted };
    if (Object.keys(extracted).length > 0) setLeadData(updatedLead);

    let convId = conversationId;
    if (!convId) convId = await createConversation();

    const historyMessages = messages
      .filter((m) => m.id !== "greeting" && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: m.content }));
    historyMessages.push({ role: "user", content: text });

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solution-ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "X-Session-ID": sessionId,
        },
        body: JSON.stringify({
          messages: historyMessages,
          conversation_id: convId,
          session_id: sessionId,
          lead_data: Object.keys(updatedLead).length > 0 ? updatedLead : undefined,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "I'm here to help! Could you tell me more?";

      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: new Date(),
      }]);

      if (data.action === "handover") setHandedOver(true);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: "I'm sorry, I'm having a little trouble. Please try again! 😊",
        timestamp: new Date(),
      }]);
    } finally {
      setThinking(false);
      setAvatarState("speaking");
      setTimeout(() => setAvatarState("idle"), 1500);
    }
  }, [thinking, messages, conversationId, leadData, sessionId, createConversation]);

  const resetChat = () => {
    setMessages([GREETING]);
    setConversationId(null);
    setLeadData({});
    setHandedOver(false);
    localStorage.removeItem("sv_conversation_id");
  };

  const showQuickActions = messages.length <= 1;

  return (
    <>
      <style>{`
        @keyframes sv-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes sv-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.93);opacity:0.7}}
        @keyframes sv-dot1{0%,60%,100%{opacity:0.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
        @keyframes sv-dot2{0%,100%{opacity:0.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}
        @keyframes sv-dot3{0%,40%,100%{opacity:0.25;transform:translateY(0)}70%{opacity:1;transform:translateY(-4px)}}
        .sv-user{background:linear-gradient(135deg,#D4AF37,#B8932A);color:#0A0A0A;border-radius:18px 18px 4px 18px;}
        .sv-ai{background:rgba(255,255,255,0.055);color:rgba(255,255,255,0.88);border-radius:18px 18px 18px 4px;border:1px solid rgba(255,255,255,0.07);}
        .sv-admin{background:rgba(59,130,246,0.12);color:rgba(255,255,255,0.88);border-radius:18px 18px 18px 4px;border:1px solid rgba(59,130,246,0.22);}
        .sv-scroll::-webkit-scrollbar{width:4px}.sv-scroll::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.25);border-radius:2px}
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!hasOpened && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.92 }}
              transition={{ delay: 1.5 }}
              className="relative cursor-pointer"
              onClick={handleOpen}
            >
              <div className="bg-[#1A1A1A] border border-[rgba(212,175,55,0.25)] rounded-2xl px-4 py-3 shadow-2xl max-w-[210px]">
                <p className="text-white text-sm font-medium leading-snug">
                  Hi! I'm <span className="text-[#F5D76E] font-bold">Solution</span> 👋<br />How can I help you?
                </p>
              </div>
              <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-[#1A1A1A] border-r border-b border-[rgba(212,175,55,0.25)] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => open ? setOpen(false) : handleOpen()}
          className="relative focus:outline-none"
          aria-label="Open SOLUTION AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-15 scale-110 hover:opacity-25 hover:scale-125 transition-all duration-300 blur-sm" />
          <div className="relative w-16 h-16 rounded-full shadow-2xl" style={{ background: "linear-gradient(135deg,#D4AF37,#8B6914)", padding: "3px" }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-[#111]">
              <SolutionAvatar state={open ? "speaking" : avatarState} size={58} />
            </div>
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0A0A0A]" />
          {unread > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">
              {unread}
            </div>
          )}
        </button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-28 right-6 z-[9998] w-[370px] max-w-[calc(100vw-24px)]"
            style={{ height: "530px", maxHeight: "calc(100vh-140px)" }}
          >
            <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl border border-[rgba(212,175,55,0.18)]"
              style={{ background: "linear-gradient(180deg,#141414 0%,#0E0E0E 100%)" }}>

              {/* Header */}
              <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[rgba(212,175,55,0.1)]"
                style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.1),rgba(139,105,20,0.06))" }}>
                <SolutionAvatar state={avatarState} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5D76E] font-black text-sm tracking-widest">SOLUTION</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <p className="text-white/35 text-[11px]">Digital Assistant · Solution Villa</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={resetChat} title="New chat" className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/8 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/8 transition-all">
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lead info */}
              {(leadData.name || leadData.email) && (
                <div className="flex-shrink-0 flex flex-wrap items-center gap-2.5 px-4 py-2 bg-[rgba(212,175,55,0.04)] border-b border-[rgba(212,175,55,0.07)]">
                  {leadData.name && <span className="flex items-center gap-1 text-[10px] text-white/35"><User className="w-3 h-3" />{leadData.name}</span>}
                  {leadData.email && <span className="flex items-center gap-1 text-[10px] text-white/35"><Mail className="w-3 h-3" />{leadData.email}</span>}
                  {leadData.phone && <span className="flex items-center gap-1 text-[10px] text-white/35"><Phone className="w-3 h-3" />{leadData.phone}</span>}
                  {leadData.company && <span className="flex items-center gap-1 text-[10px] text-white/35"><Building2 className="w-3 h-3" />{leadData.company}</span>}
                </div>
              )}

              {/* Handover */}
              {handedOver && (
                <div className="flex-shrink-0 px-4 py-2 text-center bg-blue-900/15 border-b border-blue-500/15">
                  <p className="text-blue-300 text-xs font-medium">Connecting you with a live agent...</p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 sv-scroll">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role !== "user" && (
                      <div className="flex-shrink-0 mt-auto">
                        {msg.role === "admin" ? (
                          <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/25 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-blue-300" />
                          </div>
                        ) : <SolutionAvatar state="idle" size={28} />}
                      </div>
                    )}
                    <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {msg.role === "admin" && (
                        <span className="text-[10px] text-blue-400 font-semibold px-1">Solution Villa Agent</span>
                      )}
                      <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "sv-user" : msg.role === "admin" ? "sv-admin" : "sv-ai"}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-white/18 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex gap-2.5">
                    <SolutionAvatar state="thinking" size={28} />
                    <div className="sv-ai px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" style={{ animation: "sv-dot1 1.2s ease-in-out infinite" }} />
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" style={{ animation: "sv-dot2 1.2s ease-in-out infinite" }} />
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" style={{ animation: "sv-dot3 1.2s ease-in-out infinite" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick actions */}
              {showQuickActions && (
                <div className="flex-shrink-0 flex flex-wrap gap-1.5 px-4 pb-3">
                  {QUICK_ACTIONS.map((qa) => (
                    <button key={qa.label} onClick={() => sendMessage(qa.text)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[rgba(212,175,55,0.28)] text-[#F5D76E] hover:bg-[rgba(212,175,55,0.1)] transition-all whitespace-nowrap">
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-3 border-t border-[rgba(212,175,55,0.08)]">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask me anything..."
                  disabled={thinking}
                  className="flex-1 bg-white/5 border border-white/9 rounded-full px-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[#D4AF37]/35 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || thinking}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#B8932A)" }}
                >
                  <Send className="w-4 h-4 text-[#0A0A0A]" />
                </button>
              </div>

              <div className="flex-shrink-0 py-1.5 border-t border-white/4 text-center">
                <p className="text-white/18 text-[10px] tracking-wider uppercase">Powered by Solution Villa AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
