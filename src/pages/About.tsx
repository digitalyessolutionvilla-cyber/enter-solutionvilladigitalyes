import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { motion } from "framer-motion";
import { ArrowRight, Target, Eye, Heart, Lightbulb, Shield, Users, Zap } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { teamMembers } from "@/lib/data";

const values = [
  { icon: Lightbulb, title: "Innovation", desc: "We constantly push boundaries and embrace emerging technologies." },
  { icon: Shield, title: "Reliability", desc: "We deliver on our promises with integrity and accountability." },
  { icon: Heart, title: "Partnership", desc: "We build long-term relationships, not just transactional engagements." },
  { icon: Zap, title: "Excellence", desc: "We pursue world-class quality in everything we create." },
  { icon: Users, title: "Collaboration", desc: "We work as a seamless extension of your team." },
  { icon: Target, title: "Results-Driven", desc: "Every strategy is designed to deliver measurable outcomes." },
];

const timeline = [
  { year: "2016", title: "Founded in Lagos", desc: "Solution Villa was established with a mission to bridge Africa's digital gap." },
  { year: "2018", title: "First 50 Clients", desc: "Expanded to serve businesses across Nigeria and Ghana with branding and web services." },
  { year: "2020", title: "Tech Division Launch", desc: "Launched software and mobile app development practice, serving enterprise clients." },
  { year: "2022", title: "Pan-African Expansion", desc: "Extended operations to Kenya, South Africa, and Côte d'Ivoire." },
  { year: "2023", title: "Cloud & AI Services", desc: "Added cloud infrastructure and AI-powered digital marketing capabilities." },
  { year: "2024", title: "200+ Projects Milestone", desc: "Celebrated 200 successful projects across 15 African countries." },
];

export default function About() {
  useSeo("/about");
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden gradient-hero">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)" }}
        />
        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-4"
          >
            About Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            We Are <span className="gradient-text">The Digital YES</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/65 text-xl leading-relaxed"
          >
            Solution Villa is Africa's premier digital agency — a team of innovators, strategists, designers, and engineers committed to transforming businesses through world-class digital solutions.
          </motion.p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mb-5 shadow-glow">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Our Mission</h2>
              <p className="text-white/65 leading-relaxed">
                To empower African businesses with world-class digital solutions that drive measurable growth, enhance brand value, and accelerate their journey to becoming global competitors.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mb-5 shadow-glow">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Our Vision</h2>
              <p className="text-white/65 leading-relaxed">
                To be Africa's most trusted and impactful technology partner — a company that consistently delivers "YES" to innovation, excellence, and transformative digital outcomes.
              </p>
            </motion.div>
          </div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-3">Core Values</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              What <span className="gradient-text">Drives Us</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-[#F5D76E]" />
                </div>
                <h3 className="text-white font-bold mb-2">{v.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.05), transparent)" }}>
        <div className="container-custom">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-3">Our Journey</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              The <span className="gradient-text">Story So Far</span>
            </h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.4)] to-transparent" />
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <div className="flex-1">
                  <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                    <span className="gradient-text font-black text-2xl block mb-2">{item.year}</span>
                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 top-6 -translate-x-1/2 w-4 h-4 rounded-full gradient-brand border-2 border-[#0A0A0A] shadow-glow flex-shrink-0" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-3">Leadership</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <p className="text-white/55 text-lg">The minds and talent behind Solution Villa.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            {teamMembers.slice(0, 4).map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-[rgba(212,175,55,0.4)]"
                />
                <h3 className="text-white font-bold text-sm mb-1">{member.name}</h3>
                <p className="text-[#F5D76E] text-xs font-medium">{member.position}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-8 py-4 rounded-full btn-glow hover:scale-105 transition-all duration-200"
            >
              Meet The Full Team
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-8" style={{ border: "1px solid rgba(212,175,55,0.15)", borderLeft: "none", borderRight: "none" }} />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Ready to Work <span className="gradient-text">Together?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">Let's start a conversation about your project.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 gradient-brand text-white font-bold px-10 py-5 rounded-full btn-glow hover:scale-105 transition-all duration-200"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
