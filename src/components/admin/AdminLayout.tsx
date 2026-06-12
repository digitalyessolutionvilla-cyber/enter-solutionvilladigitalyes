import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Image, BookOpen, Users, MessageSquare, Star, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, Menu, Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
  { href: "/admin/portfolio", icon: Image, label: "Portfolio" },
  { href: "/admin/case-studies", icon: Briefcase, label: "Case Studies" },
  { href: "/admin/team", icon: Users, label: "Team" },
  { href: "/admin/testimonials", icon: Star, label: "Testimonials" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
];

const superAdminItems = [
  { href: "/admin/users", icon: Users, label: "Users & Roles" },
];

const bottomItems = [
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const allNavItems = [
    ...navItems,
    ...(profile?.role === "super_admin" ? superAdminItems : []),
    ...bottomItems,
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-5 py-5 border-b border-white/8", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow">
          <span className="text-white font-black text-xs">SV</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">Solution Villa</p>
            <p className="gradient-text text-[9px] font-bold tracking-widest uppercase">Admin</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {!collapsed && (
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-5 mb-2">Main Menu</p>
        )}
        <div className="space-y-0.5 px-2">
          {allNavItems.map(({ href, icon: Icon, label }) => {
            const active = location.pathname === href || location.pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                  active
                    ? "bg-[rgba(0,102,255,0.18)] border-l-[3px] border-[#0066FF] text-white pl-2.5"
                    : "text-white/55 hover:text-white/90 hover:bg-white/6",
                  collapsed && "justify-center"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-[#00E5FF]" : "text-white/50 group-hover:text-white/80")} />
                {!collapsed && <span className={cn("text-sm font-medium", active && "font-semibold")}>{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + sign out */}
      <div className="border-t border-white/8 p-3">
        {!collapsed && profile && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {profile.full_name?.[0] ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile.full_name}</p>
              <p className="text-[10px] text-[#00E5FF] capitalize">{profile.role?.replace("_", " ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-[rgba(255,77,106,0.08)] transition-all duration-150",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060F1E] flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#0A2540] border-r border-white/8 transition-all duration-300 z-30",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0A2540] border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#0A2540] border-r border-white/8">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", collapsed ? "md:ml-16" : "md:ml-60")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#0A2540] border-b border-white/8 h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/8"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-white font-bold text-lg">
              {allNavItems.find((n) => location.pathname === n.href || location.pathname.startsWith(n.href + "/"))?.label ?? "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <Link to="/" target="_blank" className="text-white/40 text-xs hover:text-white/70 transition-colors hidden sm:block">
              View Site →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
