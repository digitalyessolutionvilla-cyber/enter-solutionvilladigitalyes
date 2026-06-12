import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePageSection } from "@/hooks/usePageSection";

interface HeroContent {
  headline1: string;
  headline2: string;
  subheadline: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  keywords: string[];
  badge_text: string;
}

interface StatItem { label: string; value: number; suffix: string; }

const DEFAULT_HERO: HeroContent = {
  headline1: "Premium Solutions.",
  headline2: "Premium Experience.",
  subheadline: "Africa's most premium technology and digital solutions agency. We deliver world-class branding, software, marketing, and media that transforms businesses into industry leaders.",
  cta_primary_text: "Start Your Premium Journey",
  cta_primary_href: "/contact",
  cta_secondary_text: "Explore Our Work",
  cta_secondary_href: "/portfolio",
  keywords: ["Premium Results", "Digital Excellence", "Brand Luxury", "Tech Innovation", "Market Leadership"],
  badge_text: "The Digital YES",
};

const DEFAULT_STATS: StatItem[] = [
  { label: "Projects Completed", value: 500, suffix: "+" },
  { label: "Happy Clients", value: 200, suffix: "+" },
  { label: "Countries Served", value: 15, suffix: "+" },
  { label: "Awards Won", value: 30, suffix: "+" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2200;
          const start = performance.now();
          const ease = (t: number) => 1 - Math.pow(2, -10 * t);
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(ease(progress) * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
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
    <span ref={ref} className="gradient-text text-4xl md:text-5xl font-black tabular-nums font-display">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection() {
  const hero = usePageSection<HeroContent>("/", "hero", DEFAULT_HERO);
  const statsData = usePageSection<StatItem[]>("/", "stats", DEFAULT_STATS);
  const keywords = Array.isArray(hero.keywords) ? hero.keywords : DEFAULT_HERO.keywords;

  const [keywordIndex, setKeywordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setKeywordIndex((i) => (i + 1) % keywords.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gold orb */}
        <div
          className="absolute -top-60 left-1/4 w-[700px] h-[700px] rounded-full animate-orb-pulse"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.03) 40%, transparent 70%)" }}
        />
        {/* Bottom right orb */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-orb-pulse"
          style={{ background: "radial-gradient(circle, rgba(245,215,110,0.07) 0%, transparent 65%)", animationDelay: "3s" }}
        />
        {/* Center depth */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 60%)" }}
        />
        {/* Luxury grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.8) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        {/* Diagonal accent lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(212,175,55,1) 0px, rgba(212,175,55,1) 1px, transparent 1px, transparent 80px)`,
          }}
        />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
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
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2.5 border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.07)] text-[#F5D76E] text-xs font-semibold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              Solution Villa — {hero.badge_text}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[1.05] tracking-tight mb-2"
          >
            {hero.headline1}
          </motion.h1>
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-[1.05] tracking-tight mb-3"
          >
            {hero.headline2}
          </motion.h1>

          {/* Animated keyword */}
          <motion.div variants={itemVariants} className="h-[1.15em] flex items-center justify-center mb-8">
            <span
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black gradient-text leading-[1.05] tracking-tight transition-all duration-400"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-12px)" }}
            >
              {keywords[keywordIndex]}
            </span>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="luxury-divider" />
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            variants={itemVariants}
            className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light"
          >
            {hero.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={hero.cta_primary_href}
              className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold text-base px-8 py-4 rounded-full btn-glow hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center shadow-luxury"
            >
              {hero.cta_primary_text}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={hero.cta_secondary_href}
              className="flex items-center gap-2 border border-[rgba(212,175,55,0.35)] text-white/80 font-medium text-base px-8 py-4 rounded-full hover:border-[#D4AF37] hover:text-[#F5D76E] transition-all duration-300 w-full sm:w-auto justify-center group backdrop-blur-sm"
            >
              {hero.cta_secondary_text}
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={itemVariants}
            className="border-t border-[rgba(212,175,55,0.12)] pt-10 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {(Array.isArray(statsData) ? statsData : DEFAULT_STATS).map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5">
                <AnimatedCounter target={Number(stat.value)} suffix={stat.suffix} />
                <span className="text-white/40 text-sm font-medium tracking-wide">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce-soft">
        <span className="text-[#D4AF37]/40 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#D4AF37]/40" />
      </div>
    </section>
  );
}
