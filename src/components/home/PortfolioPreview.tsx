import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";
import { usePageSection } from "@/hooks/usePageSection";

interface PortfolioHeader {
  eyebrow: string;
  title: string;
  title_highlighted: string;
  subtitle: string;
  cta_text: string;
  cta_href: string;
  is_visible: boolean;
}

const DEFAULT_HEADER: PortfolioHeader = {
  eyebrow: "Selected Work",
  title: "Premium",
  title_highlighted: "Portfolio",
  subtitle: "A curated selection of our finest work across branding, digital, and technology.",
  cta_text: "View All Work",
  cta_href: "/portfolio",
  is_visible: true,
};

export default function PortfolioPreview() {
  const header = usePageSection<PortfolioHeader>("/", "portfolio_header", DEFAULT_HEADER);
  const portfolioItems = usePortfolioItems();
  const [active, setActive] = useState("All");

  if (header.is_visible === false) return null;

  const allCategories = Array.from(new Set(portfolioItems.map((p) => p.category))).filter(Boolean);
  const categories = ["All", ...allCategories];

  const filtered = active === "All"
    ? portfolioItems.slice(0, 6)
    : portfolioItems.filter((p) => p.category === active).slice(0, 6);

  return (
    <section className="section-padding bg-[#111111] relative overflow-hidden">
      {/* Gold top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
      />
      <div className="h-px absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-25" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block">{header.eyebrow}</span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white">
              {header.title} <span className="gradient-text">{header.title_highlighted}</span>
            </h2>
            {header.subtitle && (
              <p className="text-white/45 text-base mt-2 max-w-md">{header.subtitle}</p>
            )}
          </div>
          <Link
            to={header.cta_href || "/portfolio"}
            className="flex items-center gap-2 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200 self-start md:self-auto"
          >
            {header.cta_text || "View All"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category filter — only show if items exist */}
        {portfolioItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-200 ${
                  active === cat
                    ? "gradient-brand text-[#0A0A0A] shadow-glow"
                    : "border border-[rgba(212,175,55,0.2)] text-white/50 hover:border-[rgba(212,175,55,0.5)] hover:text-white/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">No portfolio items yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer glass-card"
                  style={{ aspectRatio: i % 3 === 1 ? "3/4" : "4/3" }}
                >
                  <img
                    src={item.image_url ?? ""}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[rgba(10,10,10,0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">{item.category}</span>
                    <h3 className="text-white font-display font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm mb-3">{item.client}</p>
                    <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-[#F5D76E] text-sm font-semibold">
                      <ExternalLink className="w-4 h-4" /> View Project
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
