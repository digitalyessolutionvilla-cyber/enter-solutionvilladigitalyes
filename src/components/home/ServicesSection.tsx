import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Palette, TrendingUp, Video, Film, Globe, Printer, Briefcase, Smartphone, Code2, Cloud } from "lucide-react";
import { services } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, TrendingUp, Video, Film, Globe, Printer, Briefcase, Smartphone, Code2, Cloud,
};

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const Icon = iconMap[service.icon] || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className="group glass-card rounded-2xl p-7 cursor-pointer flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[rgba(0,102,255,0.15)] border border-[rgba(0,102,255,0.3)] flex items-center justify-center group-hover:bg-[rgba(0,102,255,0.25)] transition-colors duration-200">
        <Icon className="w-6 h-6 text-[#00E5FF]" />
      </div>

      {/* Tag */}
      <span className="text-[#00E5FF] text-[10px] font-bold tracking-widest uppercase">
        {service.tag}
      </span>

      {/* Title */}
      <h3 className="text-white font-bold text-lg leading-snug">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-white/60 text-sm leading-relaxed line-clamp-3 flex-1">
        {service.description}
      </p>

      {/* Learn More */}
      <div className="flex items-center gap-1.5 text-[#0066FF] text-sm font-semibold group-hover:gap-2.5 transition-all duration-200">
        Learn More
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.08) 0%, transparent 70%)" }}
      />

      <div className="container-custom relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-3 block">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            Comprehensive digital solutions designed to accelerate your growth, amplify your brand, and transform your business.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
