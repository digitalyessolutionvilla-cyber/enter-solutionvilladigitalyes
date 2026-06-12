import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { caseStudies } from "@/lib/data";

const industries = ["All", "Technology", "Fintech", "Events", "Healthcare", "Retail"];

export default function CaseStudies() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = caseStudies.filter((c) => {
    const matchesIndustry = active === "All" || c.industry === active;
    const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase()) || c.client.toLowerCase().includes(query.toLowerCase());
    return matchesIndustry && matchesQuery;
  });

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.12) 0%, transparent 65%)" }} />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase block mb-4">
            Case Studies
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
            Real <span className="gradient-text">Results</span>, Real Impact
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-xl">
            Deep dives into projects where we delivered transformative outcomes for our clients.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case studies..."
                className="w-full bg-white/5 border border-white/15 rounded-full pl-10 pr-4 py-2.5 text-white placeholder-white/35 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setActive(ind)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                    active === ind
                      ? "gradient-brand text-white shadow-glow"
                      : "border border-white/15 text-white/55 hover:text-white hover:border-white/35"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Case Studies grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((study, i) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img src={study.cover} alt={study.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {study.industry}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[#00E5FF] text-xs font-semibold mb-2">{study.client}</p>
                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">{study.title}</h3>
                  <p className="text-white/55 text-sm mb-4 line-clamp-2">{study.problem}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl bg-[rgba(0,102,255,0.08)] border border-[rgba(0,102,255,0.15)]">
                    {[study.metric1, study.metric2, study.metric3].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="gradient-text font-black text-base">{m.value}</p>
                        <p className="text-white/45 text-[10px]">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/case-studies/${study.slug}`}
                    className="flex items-center gap-1.5 text-[#0066FF] text-sm font-semibold hover:gap-2.5 transition-all duration-200"
                  >
                    Read Full Case Study
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-20 text-lg">No case studies found matching your search.</div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
