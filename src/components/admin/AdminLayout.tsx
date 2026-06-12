import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, FolderOpen, Users, MessageSquare,
  BookOpen, Settings, ChevronLeft, ChevronRight, LogOut, Crown, Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: FileText, label: "Blog Posts", href: "/admin/blog" },
  { icon: FolderOpen, label: "Portfolio", href: "/admin/portfolio" },
  { icon: BookOpen, label: "Case Studies", href: "/admin/case-studies" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: Users, label: "Team", href: "/admin/team" },
  { icon: MessageSquare, label: "Inquiries", href: "/admin/inquiries" },
  { icon: Users, label: "Users", href: "/admin/users", superAdminOnly: true },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const currentTitle = navItems.find((n) => n.href === location.pathname)?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex-shrink-0 flex flex-col bg-[#111111] border-r border-[rgba(212,175,55,0.1)] transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 p-4 border-b border-[rgba(212,175,55,0.1)]", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow">
            <Crown className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-display font-bold text-sm truncate">Solution Villa</span>
              <span className="gradient-text-static text-[8px] font-bold tracking-[0.2em] uppercase">Admin</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href, superAdminOnly }) => {
            if (superAdminOnly && profile?.role !== "super_admin") return null;
            const isActive = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[rgba(212,175,55,0.12)] text-[#F5D76E] border border-[rgba(212,175,55,0.2)]"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5",
                  collapsed && "justify-center"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#D4AF37]" : "text-white/40 group-hover:text-white/70")} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[rgba(212,175,55,0.1)] space-y-2">
          {!collapsed && profile && (
            <div className="px-3 py-2 rounded-xl bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.1)]">
              <div className="text-white/80 text-xs font-medium truncate">{profile.full_name || profile.email}</div>
              <div className="text-[#D4AF37]/60 text-[10px] capitalize tracking-wide">{profile.role?.replace("_", " ") || "Admin"}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(212,175,55,0.1)] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-display font-bold text-xl">{currentTitle}</h1>
            <p className="text-white/30 text-xs mt-0.5">Solution Villa Admin Panel</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="text-sm text-[#D4AF37]/70 hover:text-[#D4AF37] font-medium transition-colors"
          >
            View Site →
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
