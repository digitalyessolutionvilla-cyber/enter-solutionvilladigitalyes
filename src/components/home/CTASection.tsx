import { Link } from "react-router-dom";
import { ArrowRight, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { usePageSection } from "@/hooks/usePageSection";

interface CTAContent {
  title: string;
  highlighted_word: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_href: string;
  secondary_cta_text: string;
  secondary_cta_href: string;
  badges: string[];
}

const DEFAULT: CTAContent = {
  title: "Ready for",
  highlighted_word: "Premium?",
  subtitle: "Join the exclusive circle of brands that chose world-class digital excellence. Your transformation starts with a single conversation.",
  primary_cta_text: "Start Your Journey",
  primary_cta_href: "/contact",
  secondary_cta_text: "View Case Studies",
  secondary_cta_href: "/case-studies",
  badges: ["500+ Projects Delivered", "98% Client Satisfaction", "Award-Winning Agency", "10+ Years of Excellence"],
};

export default function CTASection() {
  const cta = usePageSection<CTAContent>("/", "cta", DEFAULT);
  const badges = Array.isArray(cta.badges) ? cta.badges : DEFAULT.badges;

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#111111]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 80% at center, rgba(212,175,55,0.1) 0%, transparent 70%)" }}
      />
      <div className="h-px absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-35" />
      <div className="h-px absolute bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-35" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-custom relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center animate-gold-pulse">
              <Crown className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight">
            {cta.title} <span className="gradient-text">{cta.highlighted_word}</span>
          </h2>
          <div className="luxury-divider my-6" />
          <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {cta.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 mb-10">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] text-white/60 text-sm px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                {badge}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={cta.primary_cta_href}
              className="flex items-center gap-2 gradient-brand text-[#0A0A0A] font-bold text-lg px-10 py-4 rounded-full btn-glow hover:scale-105 transition-all duration-300 shadow-luxury"
            >
              {cta.primary_cta_text}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={cta.secondary_cta_href}
              className="flex items-center gap-2 border border-[rgba(212,175,55,0.3)] text-white/70 font-medium text-lg px-10 py-4 rounded-full hover:border-[#D4AF37] hover:text-[#F5D76E] transition-all duration-300"
            >
              {cta.secondary_cta_text}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
