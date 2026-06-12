import { useCallback, useEffect, useState } from "react";
import { Clock, Search, Filter, ChevronDown } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ActivityLog {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  created: "text-green-400 bg-green-400/10 border-green-400/25",
  updated: "text-[#F5D76E] bg-[rgba(245,215,110,0.1)] border-[rgba(245,215,110,0.25)]",
  deleted: "text-red-400 bg-red-400/10 border-red-400/25",
  published: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  archived: "text-white/40 bg-white/5 border-white/15",
  invited: "text-purple-400 bg-purple-400/10 border-purple-400/25",
  viewed: "text-white/30 bg-white/5 border-white/10",
};

const ENTITY_ICONS: Record<string, string> = {
  blog_post: "Blog Post",
  portfolio_item: "Portfolio",
  case_study: "Case Study",
  team_member: "Team",
  testimonial: "Testimonial",
  media_file: "Media",
  user: "User",
  setting: "Setting",
  navigation: "Navigation",
  page_section: "Page",
  seo_setting: "SEO",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLogs() {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (!isSuperAdmin) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) query = query.eq("user_id", user.id);
    }

    const { data } = await query;
    setLogs(data ?? []);
    setLoading(false);
  }, [isSuperAdmin, page]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) => {
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchEntity = filterEntity === "all" || l.entity_type === filterEntity;
    const matchSearch = !search || (l.entity_title?.toLowerCase().includes(search.toLowerCase())) || (l.user_email?.toLowerCase().includes(search.toLowerCase()));
    return matchAction && matchEntity && matchSearch;
  });

  const uniqueActions = ["all", ...Array.from(new Set(logs.map((l) => l.action)))];
  const uniqueEntities = ["all", ...Array.from(new Set(logs.map((l) => l.entity_type)))];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-white font-display font-black text-2xl">Activity Logs</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {isSuperAdmin ? "All admin actions across all users" : "Your recent admin actions"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#D4AF37]/50" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
              className="appearance-none bg-[#1A1A1A] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50">
              {uniqueActions.map((a) => <option key={a} value={a} className="bg-[#1A1A1A] capitalize">{a === "all" ? "All Actions" : a}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}
              className="appearance-none bg-[#1A1A1A] border border-white/10 rounded-xl px-4 pr-8 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]/50">
              {uniqueEntities.map((e) => <option key={e} value={e} className="bg-[#1A1A1A]">{e === "all" ? "All Types" : ENTITY_ICONS[e] || e}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Log Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-white/30">Loading activity logs…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No activity logs found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Entity</th>
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Item</th>
                  {isSuperAdmin && <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">User</th>}
                  <th className="text-left px-5 py-3.5 text-white/40 text-xs font-semibold uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${ACTION_COLORS[log.action] || ACTION_COLORS.viewed}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white/60 text-sm capitalize">{ENTITY_ICONS[log.entity_type] || log.entity_type}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-white/80 text-sm truncate max-w-48 block">{log.entity_title || log.entity_id || "—"}</span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-white/40 text-sm">{log.user_email || "—"}</span>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className="text-white/30 text-sm whitespace-nowrap" title={new Date(log.created_at).toLocaleString()}>
                        {timeAgo(log.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {logs.length === PAGE_SIZE && (
          <div className="flex justify-center gap-3">
            {page > 0 && (
              <button onClick={() => setPage(p => p - 1)} className="border border-white/15 text-white/60 px-4 py-2 rounded-xl text-sm hover:border-[#D4AF37]/40 hover:text-white transition-all">
                Previous
              </button>
            )}
            <button onClick={() => setPage(p => p + 1)} className="border border-white/15 text-white/60 px-4 py-2 rounded-xl text-sm hover:border-[#D4AF37]/40 hover:text-white transition-all">
              Load More
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
