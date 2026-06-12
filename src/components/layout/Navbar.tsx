import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const scrollY = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const scrolled = scrollY > 80;
  const isAdmin = location.pathname.startsWith("/admin");

  // Close menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  if (isAdmin) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[rgba(6,15,30,0.95)] backdrop-blur-xl border-b border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-sm">SV</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-base tracking-tight">
                  Solution Villa
                </span>
                <span className="gradient-text text-[10px] font-semibold tracking-widest uppercase">
                  The Digital YES
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-150 relative group",
                    location.pathname === link.href
                      ? "text-[#00E5FF]"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-[#00E5FF] transition-all duration-200",
                      location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/contact"
                className="flex items-center gap-1.5 gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all duration-200"
              >
                Get a Quote
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[rgba(6,15,30,0.98)] backdrop-blur-xl border-l border-white/10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8 mt-2">
              <span className="text-white font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-base font-medium py-3 px-4 rounded-xl transition-all duration-150",
                    location.pathname === link.href
                      ? "text-[#00E5FF] bg-[rgba(0,102,255,0.15)]"
                      : "text-white/80 hover:text-white hover:bg-white/8"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 gradient-brand text-white font-semibold py-3 px-6 rounded-full btn-glow w-full"
              >
                Get a Quote
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
