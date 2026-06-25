import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { testimonials } from "@/lib/data";
import { usePageSection } from "@/hooks/usePageSection";

interface TestimonialsHeader {
  eyebrow: string;
  title: string;
  title_highlighted: string;
  subtitle: string;
  is_visible: boolean;
}

const DEFAULT_HEADER: TestimonialsHeader = {
  eyebrow: "Client Stories",
  title: "What Our",
  title_highlighted: "Clients Say",
  subtitle: "Real results from real clients. Here's what Africa's leading businesses say about working with Solution Villa.",
  is_visible: true,
};

export default function TestimonialsSection() {
  const header = usePageSection<TestimonialsHeader>("/", "testimonials_header", DEFAULT_HEADER);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const t = testimonials[index];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, filter: "blur(4px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, filter: "blur(4px)" }),
  };

  return (
    <section className="section-padding bg-[#0A0A0A] relative overflow-hidden">
      {/* Gold orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 70%)" }}
      />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block">{header.eyebrow}</span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white">
            {header.title} <span className="gradient-text">{header.title_highlighted}</span>
          </h2>
          <div className="luxury-divider mt-4" />
        </div>

        {/* Testimonial card */}
        <div
          className="max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative glass-card rounded-3xl p-10 md:p-14 overflow-hidden">
            {/* Background quote mark */}
            <div className="absolute top-6 right-8 opacity-[0.06]">
              <Quote className="w-32 h-32 text-[#D4AF37]" fill="currentColor" />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 5 ? "text-[#D4AF37]" : "text-white/15"}`}
                      fill={i < 5 ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-white/85 font-light leading-relaxed mb-8 font-display italic">
                  "{t.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow">
                    <span className="text-[#0A0A0A] font-black text-sm">
                      {(t.author_name || "?").charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-bold">{t.author_name}</div>
                    <div className="text-[#D4AF37]/70 text-sm">{t.author_title} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 px-2">
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                  className={`transition-all duration-300 rounded-full ${i === index ? "w-8 h-2 bg-[#D4AF37]" : "w-2 h-2 bg-white/20 hover:bg-[#D4AF37]/50"}`}
                />
              ))}
            </div>

            {/* Counter */}
            <span className="text-white/25 text-sm tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
