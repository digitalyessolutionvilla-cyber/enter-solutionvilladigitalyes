import { useServices } from "@/hooks/useServices";
import { usePageSection } from "@/hooks/usePageSection";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import {
  Palette, TrendingUp, Video, Film, Globe, Printer,
  Briefcase, Smartphone, Code2, Cloud, ArrowRight, CheckCircle, Zap
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, TrendingUp, Video, Film, Globe, Printer,
  Briefcase, Smartphone, Code2, Cloud,
};

const tagColors: Record<string, string> = {
  Creative: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  Growth:   "bg-green-500/15 text-green-300 border-green-500/25",
  Events:   "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Media:    "bg-pink-500/15 text-pink-300 border-pink-500/25",
  Web:      "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Print:    "bg-red-500/15 text-red-300 border-red-500/25",
  Strategy: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  Mobile:   "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  Software: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  Cloud:    "bg-sky-500/15 text-sky-300 border-sky-500/25",
};

const cardAccents: string[] = [
  "from-purple-500/8 to-violet-500/4",
  "from-green-500/8 to-emerald-500/4",
  "from-orange-500/8 to-amber-500/4",
  "from-pink-500/8 to-rose-500/4",
  "from-blue-500/8 to-indigo-500/4",
  "from-red-500/8 to-rose-500/4",
  "from-yellow-500/8 to-amber-500/4",
  "from-cyan-500/8 to-teal-500/4",
  "from-indigo-500/8 to-blue-500/4",
  "from-sky-500/8 to-blue-500/4",
];

// ── Types matching page_sections JSON ────────────────────────
interface Stat { value: string; label: string; }
interface Benefit { title: string; desc: string; }
interface ProcessStep { step: string; title: string; desc: string; }

interface HeroContent {
  badge_text: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  features: string[];
  stats: Stat[];
}
interface WhyUsContent {
  badge_text: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  benefits: Benefit[];
  process_steps: ProcessStep[];
}
interface CtaContent {
  title: string;
  title_highlight: string;
  subtitle: string;
  button1_text: string;
  button2_text: string;
}

const DEFAULT_HERO: HeroContent = {
  badge_text: "What We Do",
  title: "Premium Solutions",
  title_highlight: "For Every Challenge",
  subtitle: "From brand identity to enterprise software — we deliver world-class digital solutions that drive measurable growth for ambitious businesses across Africa and beyond.",
  features: ["End-to-end project delivery", "Dedicated account manager", "On-time, on-budget guarantee", "Post-launch support included"],
  stats: [
    { value: "200+", label: "Projects Delivered" },
    { value: "9", label: "Core Services" },
    { value: "10+", label: "Years Experience" },
    { value: "98%", label: "Client Satisfaction" },
  ],
};

const DEFAULT_WHY_US: WhyUsContent = {
  badge_text: "The Digital YES",
  title: "We Say YES to Every",
  title_highlight: "Digital Challenge",
  subtitle: "At Solution Villa, no project is too big or too complex. Since 2016, we've built our reputation by delivering premium results for every client — from startups to established enterprises across Africa and beyond.",
  benefits: [
    { title: "Full-Service Capability", desc: "One agency for branding, tech, marketing, and media — seamlessly integrated." },
    { title: "Results-Driven Approach", desc: "Every solution is built with measurable outcomes and ROI in mind." },
    { title: "Expert Team", desc: "Seasoned professionals across design, engineering, marketing, and strategy." },
    { title: "African Market Intelligence", desc: "Deep understanding of the African business landscape and consumer behavior." },
  ],
  process_steps: [
    { step: "01", title: "Discovery & Strategy", desc: "We deep-dive into your business, goals, and audience to craft a tailored roadmap." },
    { step: "02", title: "Design & Development", desc: "Our team executes with precision — beautiful design meets robust engineering." },
    { step: "03", title: "Launch & Optimization", desc: "We go live, monitor performance, and iterate to maximize impact." },
    { step: "04", title: "Ongoing Partnership", desc: "Long-term support and continuous improvement — we grow with you." },
  ],
};

const DEFAULT_CTA: CtaContent = {
  title: "Ready to Start Your",
  title_highlight: "Next Project?",
  subtitle: "Tell us about your vision — we'll build the perfect solution. No challenge is too big, no dream too ambitious.",
  button1_text: "Start a Project",
  button2_text: "View Our Work",
};

export default function Services() {
  const services = useServices();
  const hero = usePageSection<HeroContent>("/services", "hero", DEFAULT_HERO);
  const whyUs = usePageSection<WhyUsContent>("/services", "why_us", DEFAULT_WHY_US);
  const cta = usePageSection<CtaContent>("/services", "cta", DEFAULT_CTA);

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.06)] mb-6">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-wider uppercase">{hero.badge_text}</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6">
            {hero.title}<br />
            <span className="gradient-text-static">{hero.title_highlight}</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {hero.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {(hero.features || []).map((f) => (
              <div key={f} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/4 border border-white/8">
                <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16 pt-10 border-t border-white/6">
            {(hero.stats || []).map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-[#D4AF37] font-display">{stat.value}</div>
                <div className="text-white/35 text-xs font-medium mt-1 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Globe;
              const accent = cardAccents[i % cardAccents.length];
              const tagCls = tagColors[service.tag] || tagColors.Web;
              const num = String(i + 1).padStart(2, "0");

              return (
                <div key={service.id || i}
                  className="group relative rounded-2xl border border-white/6 overflow-hidden transition-all duration-500 hover:border-[rgba(212,175,55,0.3)] hover:shadow-2xl hover:-translate-y-1"
                  style={{ background: "#0D0D0D" }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative p-7">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-white/10 text-4xl font-black font-display leading-none">{num}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${tagCls}`}>
                        {service.tag}
                      </span>
                    </div>

                    <div className="w-14 h-14 rounded-xl bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.15)] flex items-center justify-center mb-5 group-hover:bg-[rgba(212,175,55,0.14)] group-hover:border-[rgba(212,175,55,0.3)] transition-all duration-300">
                      <Icon className="w-6 h-6 text-[#D4AF37]" />
                    </div>

                    <h3 className="text-white font-display font-bold text-xl mb-3 group-hover:text-[#F5D76E] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-white/45 text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <Link to="/contact"
                      className="inline-flex items-center gap-2 text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider hover:text-[#D4AF37] transition-colors group/link">
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section className="py-20" style={{ background: "linear-gradient(180deg,#0A0A0A 0%,#0D0B06 50%,#0A0A0A 100%)" }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] mb-6">
                <span className="text-[#D4AF37] text-xs font-semibold tracking-wider uppercase">{whyUs.badge_text}</span>
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight mb-6">
                {whyUs.title} <span className="gradient-text-static">{whyUs.title_highlight}</span>
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">{whyUs.subtitle}</p>
              <div className="space-y-4">
                {(whyUs.benefits || []).map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm mb-0.5">{item.title}</div>
                      <div className="text-white/40 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white/30 text-xs font-bold uppercase tracking-[0.25em] mb-6">Our Process</h3>
              {(whyUs.process_steps || []).map((item) => (
                <div key={item.step}
                  className="flex gap-5 p-5 rounded-xl border border-white/5 bg-white/2 hover:border-[rgba(212,175,55,0.2)] hover:bg-[rgba(212,175,55,0.03)] transition-all duration-300">
                  <span className="text-[#D4AF37]/25 font-black text-2xl font-display leading-none flex-shrink-0 mt-0.5">{item.step}</span>
                  <div>
                    <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                    <div className="text-white/35 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden border border-[rgba(212,175,55,0.2)] p-12 md:p-16 text-center"
            style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.08) 0%,rgba(139,105,20,0.04) 50%,rgba(212,175,55,0.08) 100%)" }}>
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(212,175,55,0.1) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
                {cta.title}<br /><span className="gradient-text-static">{cta.title_highlight}</span>
              </h2>
              <p className="text-white/45 text-lg max-w-xl mx-auto mb-10">{cta.subtitle}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#0A0A0A] text-sm shadow-glow transition-all duration-300 hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#B8932A)" }}>
                  {cta.button1_text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/portfolio"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white text-sm border border-white/15 hover:border-[rgba(212,175,55,0.4)] hover:text-[#D4AF37] transition-all duration-300">
                  {cta.button2_text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
