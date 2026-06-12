import { useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { portfolioItems } from "@/lib/data";

const categories = ["All", "Branding", "Websites", "Mobile Apps", "Events", "Media", "Software", "Printing", "Marketing"];

export default function Portfolio() {
  useSeo("/portfolio");
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = active === "All" ? portfolioItems : portfolioItems.filter((p) => p.category === active);

  const openLightbox = (id: number) => setLightbox(id);
  const closeLightbox = () => setLightbox(null);

  const currentIndex = lightbox !== null ? filtered.findIndex((p) => p.id === lightbox) : -1;
  const currentItem = currentIndex >= 0 ? filtered[currentIndex] : null;

  const navigate = (dir: number) => {
    if (currentIndex < 0) return;
    const next = (currentIndex + dir + filtered.length) % filtered.length;
    setLightbox(filtered[next].id);
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden gradient-hero">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)" }}
        />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-4">
            Our Portfolio
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
            Our <span className="gradient-text">Work</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-xl">
            A curated showcase of projects that define our craft — from brand identities to enterprise software across Africa.
          </motion.p>
        </div>
      </section>

      {/* Portfolio */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
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

          {/* Masonry-style grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer break-inside-avoid mb-5"
                  onClick={() => openLightbox(item.id)}
                  style={{ aspectRatio: i % 4 === 0 ? "4/5" : i % 3 === 0 ? "3/4" : "4/3" }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.95)] via-[rgba(10,10,10,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[#F5D76E] text-[10px] font-bold tracking-widest uppercase mb-1 block">{item.category}</span>
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{item.client}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[rgba(212,175,55,0.85)] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-20 text-lg">No items found in this category.</div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
              <div className="mt-4 text-center">
                <span className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase">{currentItem.category}</span>
                <h3 className="text-white font-bold text-xl mt-1">{currentItem.title}</h3>
                <p className="text-white/55 text-sm mt-1">{currentItem.description}</p>
              </div>

              <button onClick={closeLightbox} className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-[#F5D76E] hover:text-[#F5D76E] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => navigate(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:border-[#F5D76E] hover:text-[#F5D76E] transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
