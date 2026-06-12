import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/data";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % testimonials.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const t = testimonials[current];

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060F1E 0%, #0A2540 50%, #060F1E 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.07) 0%, transparent 70%)" }}
      />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-3 block">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card rounded-3xl p-8 md:p-12 text-center"
            >
              <Quote className="w-12 h-12 text-[#00E5FF] opacity-40 mx-auto mb-6" />
              <p className="text-white/85 text-lg md:text-xl leading-relaxed italic mb-8">
                "{t.quote}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={t.avatar_url}
                  alt={t.author_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#00E5FF]"
                />
                <div className="text-left">
                  <p className="text-white font-bold text-base">{t.author_name}</p>
                  <p className="text-white/50 text-sm">{t.author_title} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 text-white/60 flex items-center justify-center hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-[#00E5FF]"
                      : "w-2 h-2 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 text-white/60 flex items-center justify-center hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
