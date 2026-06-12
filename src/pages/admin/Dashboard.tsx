import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, Image, Users, TrendingUp, Clock, Eye, Star } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Stats {
  inquiries: number;
  blog_posts: number;
  portfolio_items: number;
  team_members: number;
}

function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  delta?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <p className="text-white/50 text-sm mb-2">{label}</p>
      <p className="text-white font-black text-3xl">{value}</p>
      {delta && (
        <p className="text-green-400 text-xs font-semibold mt-1">{delta}</p>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ inquiries: 0, blog_posts: 0, portfolio_items: 0, team_members: 0 });
  const [recentInquiries, setRecentInquiries] = useState<Array<{ id: string; name: string; email: string; subject: string | null; created_at: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [inq, blog, portfolio, team, recentInq] = await Promise.all([
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("id, name, email, subject, created_at, status").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        inquiries: inq.count ?? 0,
        blog_posts: blog.count ?? 0,
        portfolio_items: portfolio.count ?? 0,
        team_members: team.count ?? 0,
      });
      setRecentInquiries(recentInq.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { icon: MessageSquare, label: "Total Inquiries", value: stats.inquiries, delta: "All time", color: "bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.3)]" },
    { icon: FileText, label: "Blog Posts", value: stats.blog_posts, delta: "Published & draft", color: "bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.2)]" },
    { icon: Image, label: "Portfolio Items", value: stats.portfolio_items, delta: "All categories", color: "bg-[rgba(245,215,110,0.12)] border border-[rgba(245,215,110,0.25)]" },
    { icon: Users, label: "Team Members", value: stats.team_members, delta: "Active", color: "bg-[rgba(212,175,55,0.18)] border border-[rgba(212,175,55,0.28)]" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-white font-black text-2xl md:text-3xl">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="text-white/45 mt-1">Here's what's happening at Solution Villa today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        {/* Recent Inquiries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Recent Inquiries</h2>
            <a href="/admin/inquiries" className="text-[#D4AF37] text-sm hover:text-[#F5D76E] transition-colors font-medium">View all →</a>
          </div>

          <div className="bg-[#1A1A1A] border border-white/8 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-white/40">Loading...</div>
            ) : recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-white/40">No inquiries yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-black/20">
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Subject</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inq, i) => (
                    <tr key={inq.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i === recentInquiries.length - 1 ? "border-0" : ""}`}>
                      <td className="px-4 py-3 text-white text-sm font-medium">{inq.name}</td>
                      <td className="px-4 py-3 text-white/60 text-sm hidden md:table-cell">{inq.email}</td>
                      <td className="px-4 py-3 text-white/60 text-sm hidden sm:table-cell">{inq.subject ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          inq.status === "new" ? "bg-[rgba(245,215,110,0.12)] text-[#F5D76E] border border-[rgba(245,215,110,0.25)]" :
                          inq.status === "read" ? "bg-[rgba(255,176,32,0.12)] text-yellow-400 border border-[rgba(255,176,32,0.25)]" :
                          "bg-[rgba(0,200,150,0.12)] text-green-400 border border-[rgba(0,200,150,0.25)]"
                        }`}>
                          {inq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/admin/blog", label: "New Blog Post", icon: FileText, color: "from-purple-600/40 to-purple-600/20" },
              { href: "/admin/portfolio", label: "Add Portfolio", icon: Image, color: "from-cyan-600/40 to-cyan-600/20" },
              { href: "/admin/team", label: "Add Team Member", icon: Users, color: "from-green-600/40 to-green-600/20" },
              { href: "/admin/testimonials", label: "Add Testimonial", icon: Star, color: "from-yellow-600/40 to-yellow-600/20" },
            ].map(({ href, label, icon: Icon, color }) => (
              <a
                key={label}
                href={href}
                className={`glass-card bg-gradient-to-br ${color} rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200`}
              >
                <Icon className="w-6 h-6 text-white/70" />
                <span className="text-white text-sm font-semibold">{label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
