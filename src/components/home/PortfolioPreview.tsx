import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { portfolioItems } from "@/lib/data";

const categories = ["All", "Branding", "Websites", "Mobile Apps", "Events", "Media", "Software", "Marketing"];

export default function PortfolioPreview() {
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? portfolioItems.slice(0, 6)
    : portfolioItems.filter((p) => p.category === active).slice(0, 6);

  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at bottom right, rgba(0,229,255,0.06) 0%, transparent 65%)" }}
      />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-3 block">
            Our Work
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Featured <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            A showcase of transformative projects delivered with precision and creativity across Africa.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                active === cat
                  ? "gradient-brand text-white shadow-glow"
                  : "border border-white/15 text-white/55 hover:text-white hover:border-white/35"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: i % 3 === 1 ? "3/4" : "4/3" }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,15,30,0.95)] via-[rgba(6,15,30,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-1 block">
                    {item.category}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/65 text-sm line-clamp-2">{item.description}</p>
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[rgba(0,102,255,0.8)] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-8 py-4 rounded-full btn-glow hover:scale-105 transition-all duration-200"
          >
            View All Work
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
