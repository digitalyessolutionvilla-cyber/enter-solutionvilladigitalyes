import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { stats } from "@/lib/data";

const keywords = ["Digital Success", "Business Growth", "Brand Excellence", "Tech Innovation", "Market Leadership"];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = performance.now();
          const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(easeOutExpo(progress) * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="gradient-text text-4xl md:text-5xl font-black tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection() {
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setKeywordIndex((i) => (i + 1) % keywords.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden gradient-hero">
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-orb-pulse"
          style={{ background: "radial-gradient(circle, rgba(0,102,255,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-orb-pulse"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,47,122,0.4) 0%, transparent 65%)" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,102,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 pt-28 pb-16">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 border border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.08)] text-[#00E5FF] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              The Digital YES — Solution Villa
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-2"
          >
            Turning Ideas Into
          </motion.h1>
          <motion.div variants={itemVariants} className="h-[1.15em] flex items-center justify-center mb-6">
            <span
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black gradient-text leading-[1.05] tracking-tight transition-all duration-400"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)" }}
            >
              {keywords[keywordIndex]}
            </span>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            variants={itemVariants}
            className="text-white/65 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Africa's premier technology agency providing innovative branding, digital marketing, media production, software development, and business solutions that help organizations grow faster.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/contact"
              className="flex items-center gap-2 gradient-brand text-white font-semibold text-base px-8 py-4 rounded-full btn-glow hover:scale-105 hover:btn-glow-lg transition-all duration-200 w-full sm:w-auto justify-center"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/portfolio"
              className="flex items-center gap-2 border-2 border-white/25 text-white font-medium text-base px-8 py-4 rounded-full hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-200 w-full sm:w-auto justify-center group"
            >
              <Play className="w-4 h-4 fill-current" />
              Explore Our Work
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/10 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <span className="text-white/55 text-sm font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce-soft">
        <span className="text-white/30 text-xs tracking-wider uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-white/30" />
      </div>
    </section>
  );
}
