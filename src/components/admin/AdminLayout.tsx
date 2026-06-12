import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, FolderOpen, Users, MessageSquare,
  BookOpen, Settings, ChevronLeft, ChevronRight, LogOut, Crown, Star,
  Image, Clock, Search, Menu, Layout, BarChart2, Headphones
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { divider: true, label: "Content" },
  { icon: FileText, label: "Blog Posts", href: "/admin/blog" },
  { icon: FolderOpen, label: "Portfolio", href: "/admin/portfolio" },
  { icon: BookOpen, label: "Case Studies", href: "/admin/case-studies" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: Users, label: "Team", href: "/admin/team" },
  { icon: MessageSquare, label: "Inquiries", href: "/admin/inquiries" },
  { icon: Headphones, label: "Live Chat", href: "/admin/live-chat", badge: "waiting" },
  { divider: true, label: "Site Management" },
  { icon: Layout, label: "Content Editor", href: "/admin/content" },
  { icon: BarChart2, label: "Services", href: "/admin/services" },
  { icon: Image, label: "Hero Slides", href: "/admin/hero-slides" },
  { icon: Image, label: "Media Library", href: "/admin/media" },
  { icon: Menu, label: "Navigation", href: "/admin/navigation" },
  { icon: Search, label: "SEO Settings", href: "/admin/seo" },
  { divider: true, label: "System" },
  { icon: Clock, label: "Activity Logs", href: "/admin/activity-logs" },
  { icon: Users, label: "Users", href: "/admin/users", superAdminOnly: true },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  // Poll waiting chats every 15s
  useEffect(() => {
    const fetch = async () => {
      const { count } = await supabase
        .from("chat_conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "waiting");
      setWaitingCount(count ?? 0);
    };
    fetch();
    const t = setInterval(fetch, 15000);
    return () => clearInterval(t);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const currentTitle = navItems.find((n) => "href" in n && n.href === location.pathname)?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 flex flex-col bg-[#0D0D0D] border-r border-[rgba(212,175,55,0.08)] transition-all duration-300",
          collapsed ? "w-14" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 p-3.5 border-b border-[rgba(212,175,55,0.08)]", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow">
            <Crown className="w-3.5 h-3.5 text-[#0A0A0A]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-display font-bold text-sm truncate">Solution Villa</span>
              <span className="gradient-text-static text-[8px] font-bold tracking-[0.2em] uppercase">CMS Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
          {navItems.map((item, i) => {
            if ("divider" in item && item.divider) {
              if (collapsed) return null;
              return (
                <div key={i} className="px-2 pt-3 pb-1">
                  <span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              );
            }
            if (!("href" in item)) return null;
            if ("superAdminOnly" in item && item.superAdminOnly && profile?.role !== "super_admin") return null;

            const isActive = (location.pathname === item.href && item.href !== "/admin/dashboard") ||
              (item.href === "/admin/dashboard" && (location.pathname === "/admin/dashboard" || location.pathname === "/admin"));
            const Icon = item.icon as React.ComponentType<{ className?: string }>;
            const showBadge = "badge" in item && item.badge === "waiting" && waitingCount > 0;

            return (
              <Link
                key={item.href as string}
                to={item.href as string}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-[rgba(212,175,55,0.1)] text-[#F5D76E] border border-[rgba(212,175,55,0.15)]"
                    : "text-white/40 hover:text-white/80 hover:bg-white/4",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label as string : undefined}
              >
                <div className="relative flex-shrink-0">
                  {Icon && <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#D4AF37]" : "text-white/30 group-hover:text-white/60")} />}
                  {showBadge && collapsed && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 text-[0px] border border-[#0D0D0D]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label as string}</span>
                    {showBadge && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 text-[9px] font-bold border border-yellow-400/25">
                        {waitingCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-[rgba(212,175,55,0.08)] space-y-1">
          {!collapsed && profile && (
            <div className="px-2.5 py-2 rounded-lg bg-[rgba(212,175,55,0.04)] border border-[rgba(212,175,55,0.08)] mb-1">
              <div className="text-white/70 text-xs font-medium truncate">{profile.full_name || "Admin"}</div>
              <div className="text-[#D4AF37]/50 text-[10px] capitalize">{profile.role?.replace("_", " ") || "Admin"}</div>
            </div>
          )}
          <button onClick={handleSignOut}
            className={cn("flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-white/30 hover:text-red-400 hover:bg-red-500/8 transition-all",
              collapsed && "justify-center")}>
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
          <button onClick={() => setCollapsed(!collapsed)}
            className={cn("flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-white/20 hover:text-white/50 hover:bg-white/4 transition-all",
              collapsed && "justify-center")}>
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <><ChevronLeft className="w-3.5 h-3.5" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[rgba(10,10,10,0.97)] backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)] px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-white font-display font-bold text-lg">{currentTitle}</h1>
            <p className="text-white/25 text-[10px] mt-0.5">Solution Villa · CMS</p>
          </div>
          <div className="flex items-center gap-3">
            {waitingCount > 0 && (
              <Link to="/admin/live-chat"
                className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium border border-yellow-400/25 rounded-full px-3 py-1.5 bg-yellow-400/5 hover:bg-yellow-400/10 transition-all">
                <Headphones className="w-3.5 h-3.5" />
                {waitingCount} chat{waitingCount !== 1 ? "s" : ""} waiting
              </Link>
            )}
            <Link to="/" target="_blank" className="text-xs text-[#D4AF37]/50 hover:text-[#D4AF37] font-medium transition-colors border border-[rgba(212,175,55,0.12)] rounded-full px-3 py-1.5 hover:bg-[rgba(212,175,55,0.06)]">
              View Site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
