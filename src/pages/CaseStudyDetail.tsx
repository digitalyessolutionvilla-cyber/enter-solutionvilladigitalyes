import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, TrendingUp } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { caseStudies } from "@/lib/data";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const study = caseStudies.find((c) => c.slug === slug);

  if (!study) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <p className="gradient-text text-6xl font-black mb-4">404</p>
            <h1 className="text-white font-bold text-2xl mb-4">Case Study Not Found</h1>
            <Link to="/case-studies" className="text-[#0066FF] hover:text-[#00E5FF] transition-colors">
              ← Back to Case Studies
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-28 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.12) 0%, transparent 65%)" }} />
        <div className="container-custom relative z-10 max-w-5xl pb-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/case-studies" className="inline-flex items-center gap-2 text-white/50 hover:text-[#00E5FF] text-sm transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Case Studies
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">{study.industry}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{study.title}</h1>

            <div className="flex items-center gap-2 text-white/55 text-sm">
              <Building2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Client: <strong className="text-white">{study.client}</strong></span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      <div className="container-custom max-w-5xl">
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          src={study.cover}
          alt={study.title}
          className="w-full rounded-2xl aspect-video object-cover"
        />
      </div>

      {/* Results bar */}
      <section className="py-10">
        <div className="container-custom max-w-5xl">
          <div className="glass-card rounded-2xl p-6 grid grid-cols-3 gap-4">
            {[study.metric1, study.metric2, study.metric3].map((m) => (
              <div key={m.label} className="text-center">
                <p className="gradient-text font-black text-3xl md:text-4xl">{m.value}</p>
                <p className="text-white/55 text-sm mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Challenge", content: study.problem, color: "border-red-500/30" },
              { title: "Our Solution", content: study.solution, color: "border-[#0066FF]/40" },
              { title: "The Results", content: study.results, color: "border-green-500/30" },
            ].map((section) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`glass-card rounded-2xl p-6 border-t-2 ${section.color}`}
              >
                <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
                  {section.title}
                </h3>
                <p className="text-white/65 leading-relaxed text-sm">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 glass-card rounded-2xl p-8 text-center"
          >
            <h2 className="text-white font-black text-2xl md:text-3xl mb-4">
              Ready for Similar <span className="gradient-text">Results?</span>
            </h2>
            <p className="text-white/55 mb-6">Let's build your success story together.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 gradient-brand text-white font-bold px-8 py-4 rounded-full btn-glow hover:scale-105 transition-all duration-200">
              Start Your Project
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
