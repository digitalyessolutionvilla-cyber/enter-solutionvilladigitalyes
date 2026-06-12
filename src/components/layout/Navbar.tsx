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

  useEffect(() => setMobileOpen(false), [location]);

  if (isAdmin) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[rgba(10,10,10,0.96)] backdrop-blur-xl border-b border-[rgba(212,175,55,0.12)] shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
                <span className="text-[#0A0A0A] font-black text-sm tracking-tight">SV</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-base tracking-tight font-display">
                  Solution Villa
                </span>
                <span className="gradient-text-static text-[9px] font-semibold tracking-[0.25em] uppercase">
                  The Digital YES
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-200 relative group tracking-wide",
                    location.pathname === link.href
                      ? "text-[#F5D76E]"
                      : "text-white/65 hover:text-white"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-[#D4AF37] transition-all duration-300",
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
                className="flex items-center gap-1.5 gradient-brand text-[#0A0A0A] text-sm font-bold px-5 py-2.5 rounded-full btn-glow hover:scale-105 transition-all duration-300"
              >
                Get a Quote
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/70 hover:text-[#D4AF37] p-2 rounded-lg hover:bg-[rgba(212,175,55,0.08)] transition-all"
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#111111] border-l border-[rgba(212,175,55,0.15)] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8 mt-2">
              <span className="text-[#D4AF37] font-display font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/40 hover:text-[#D4AF37] p-2 rounded-lg hover:bg-[rgba(212,175,55,0.08)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-base font-medium py-3 px-4 rounded-xl transition-all duration-200",
                    location.pathname === link.href
                      ? "text-[#F5D76E] bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)]"
                      : "text-white/65 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 gradient-brand text-[#0A0A0A] font-bold py-3.5 px-6 rounded-full btn-glow w-full"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
