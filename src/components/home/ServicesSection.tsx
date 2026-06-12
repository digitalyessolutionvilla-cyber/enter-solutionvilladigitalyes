import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Palette, TrendingUp, Video, Film, Globe, Printer, Briefcase, Smartphone, Code2, Cloud } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { usePageSection } from "@/hooks/usePageSection";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, TrendingUp, Video, Film, Globe, Printer, Briefcase, Smartphone, Code2, Cloud,
};

interface ServicesHeader {
  eyebrow: string;
  title: string;
  title_highlighted: string;
  subtitle: string;
}

const DEFAULT_HEADER: ServicesHeader = {
  eyebrow: "What We Do",
  title: "Our",
  title_highlighted: "Premium Services",
  subtitle: "Comprehensive luxury digital solutions designed to elevate your brand, accelerate growth, and deliver world-class results.",
};

function ServiceCard({ service, index }: { service: { icon: string; title: string; description?: string; tag?: string; link_href?: string }; index: number }) {
  const Icon = iconMap[service.icon] || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className="group glass-card rounded-2xl p-7 cursor-pointer flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-400 relative overflow-hidden"
    >
      {/* Top gold line on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center group-hover:bg-[rgba(212,175,55,0.15)] group-hover:border-[rgba(212,175,55,0.4)] transition-all duration-300">
        <Icon className="w-6 h-6 text-[#D4AF37] group-hover:text-[#F5D76E] transition-colors duration-200" />
      </div>

      {/* Tag */}
      <span className="text-[#D4AF37]/60 text-[10px] font-bold tracking-[0.2em] uppercase">
        {service.tag}
      </span>

      {/* Title */}
      <h3 className="text-white font-display font-bold text-lg leading-snug group-hover:text-[#F5D76E] transition-colors duration-200">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-white/45 text-sm leading-relaxed line-clamp-3 flex-1">
        {service.description}
      </p>

      {/* Learn More */}
      <div className="flex items-center gap-1.5 text-[#D4AF37]/70 text-sm font-semibold group-hover:gap-2.5 group-hover:text-[#D4AF37] transition-all duration-200">
        Learn More
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const services = useServices();
  const header = usePageSection<ServicesHeader>("/", "services_header", DEFAULT_HEADER);

  return (
    <section id="services" className="section-padding relative overflow-hidden bg-[#0A0A0A]">
      {/* Subtle gold center glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, rgba(212,175,55,0.05) 0%, transparent 70%)" }}
      />

      <div className="container-custom relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
            {header.eyebrow}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-4">
            {header.title} <span className="gradient-text">{header.title_highlighted}</span>
          </h2>
          <div className="luxury-divider my-5" />
          <p className="text-white/45 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {header.subtitle}
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
