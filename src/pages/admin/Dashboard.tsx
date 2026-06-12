import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, Image, Users, TrendingUp, Clock, Eye, Star, Download, BarChart2, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  inquiries: number;
  blog_posts: number;
  portfolio_items: number;
  team_members: number;
  testimonials: number;
  media_files: number;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  created_at: string;
  status: string;
}

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5D76E";
const GOLD_DARK = "#9D7E22";

const STATUS_COLORS: Record<string, string> = {
  new: "text-[#F5D76E] border-[rgba(245,215,110,0.3)] bg-[rgba(245,215,110,0.1)]",
  read: "text-white/50 border-white/20 bg-white/5",
  replied: "text-green-400 border-green-400/30 bg-green-400/10",
};

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
    >
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <p className="text-white/40 text-sm mb-1">{label}</p>
      <p className="text-white font-black text-3xl tabular-nums">{value}</p>
    </motion.div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#1A1A1A", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, color: "#fff" },
  labelStyle: { color: "#D4AF37", fontWeight: 600 },
  cursor: { fill: "rgba(212,175,55,0.06)" },
};

function exportCsv(inquiries: RecentInquiry[]) {
  const headers = ["Name", "Email", "Subject", "Status", "Date"];
  const rows = inquiries.map((i) => [i.name, i.email, i.subject || "", i.status, new Date(i.created_at).toLocaleDateString()]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "inquiries.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ inquiries: 0, blog_posts: 0, portfolio_items: 0, team_members: 0, testimonials: 0, media_files: 0 });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; inquiries: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [inq, blog, portfolio, team, testimonials, media, recentInq, portCats, actLogs] = await Promise.all([
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("media_files").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id, name, email, subject, created_at, status").order("created_at", { ascending: false }).limit(8),
        supabase.from("portfolio_items").select("category"),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        inquiries: inq.count ?? 0,
        blog_posts: blog.count ?? 0,
        portfolio_items: portfolio.count ?? 0,
        team_members: team.count ?? 0,
        testimonials: testimonials.count ?? 0,
        media_files: media.count ?? 0,
      });
      setRecentInquiries(recentInq.data ?? []);
      setActivityCount(actLogs.count ?? 0);

      // Build weekly inquiry data (last 7 days)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { day: d.toLocaleDateString("en", { weekday: "short" }), date: d.toISOString().slice(0, 10), inquiries: 0 };
      });
      (recentInq.data ?? []).forEach((r: RecentInquiry) => {
        const d = r.created_at.slice(0, 10);
        const found = days.find((dd) => dd.date === d);
        if (found) found.inquiries++;
      });
      setWeeklyData(days);

      // Portfolio by category
      const catMap: Record<string, number> = {};
      (portCats.data ?? []).forEach((p: { category: string }) => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { icon: MessageSquare, label: "Total Inquiries", value: stats.inquiries, color: "bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]" },
    { icon: FileText, label: "Blog Posts", value: stats.blog_posts, color: "bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.18)]" },
    { icon: Image, label: "Portfolio Items", value: stats.portfolio_items, color: "bg-[rgba(245,215,110,0.1)] border border-[rgba(245,215,110,0.2)]" },
    { icon: Users, label: "Team Members", value: stats.team_members, color: "bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.22)]" },
    { icon: Star, label: "Testimonials", value: stats.testimonials, color: "bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)]" },
    { icon: Image, label: "Media Files", value: stats.media_files, color: "bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.2)]" },
  ];

  const PIE_COLORS = [GOLD, GOLD_LIGHT, GOLD_DARK, "#B8962E", "#7A5F14", "#E8C840"];

  return (
    <AdminLayout>
      <div className="space-y-7">
        {/* Welcome */}
        <div>
          <h1 className="text-white font-display font-black text-2xl">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Here's an overview of your Solution Villa CMS</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 0.08} />
          ))}
        </div>

        {/* Charts Row */}
        {!loading && (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Weekly Inquiries */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold">Inquiries (Last 7 Days)</h2>
                  <p className="text-white/30 text-xs mt-0.5">Contact form submissions</p>
                </div>
                <BarChart2 className="w-5 h-5 text-[#D4AF37]/40" />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} barSize={28}>
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="inquiries" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Portfolio by Category */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white font-bold">Portfolio</h2>
                  <p className="text-white/30 text-xs mt-0.5">By category</p>
                </div>
              </div>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-white/20 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#fff" }} />
                    <Legend formatter={(v) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Activity + Inquiries */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Quick Stats */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Quick Stats</h2>
            {[
              { icon: Activity, label: "Activity Log Entries", value: activityCount },
              { icon: Clock, label: "New Inquiries", value: recentInquiries.filter((i) => i.status === "new").length },
              { icon: Eye, label: "Pending Review", value: recentInquiries.filter((i) => i.status === "read").length },
              { icon: TrendingUp, label: "Replied", value: recentInquiries.filter((i) => i.status === "replied").length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.08)] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#D4AF37]/60" />
                  </div>
                  <span className="text-white/50 text-sm">{label}</span>
                </div>
                <span className="text-white font-bold tabular-nums">{value}</span>
              </div>
            ))}
          </div>

          {/* Recent Inquiries */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Recent Inquiries</h2>
              <button onClick={() => exportCsv(recentInquiries)}
                className="flex items-center gap-1.5 text-[#D4AF37]/70 text-xs font-semibold hover:text-[#D4AF37] transition-colors border border-[rgba(212,175,55,0.2)] rounded-full px-3 py-1.5 hover:bg-[rgba(212,175,55,0.08)]">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
            {recentInquiries.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">No inquiries yet</div>
            ) : (
              <div className="space-y-2">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.08)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#D4AF37] text-xs font-bold">{inq.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 text-sm font-medium truncate">{inq.name}</span>
                        <span className={`text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 flex-shrink-0 ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                      </div>
                      <span className="text-white/30 text-xs truncate block">{inq.subject || inq.email}</span>
                    </div>
                    <span className="text-white/20 text-xs flex-shrink-0">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
