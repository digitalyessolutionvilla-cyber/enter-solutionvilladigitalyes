import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { teamMembers } from "@/lib/data";

const departments = ["All", "Leadership", "Technology", "Design", "Marketing", "Events"];

export default function Team() {
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? teamMembers
    : teamMembers.filter((m) => m.department === active);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden gradient-hero">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(0,229,255,0.1) 0%, transparent 60%)" }}
        />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase block mb-4">
            Our Team
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
            The <span className="gradient-text">People</span> Behind the Magic
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-xl">
            A diverse team of creative thinkers, engineers, strategists, and storytellers united by a passion for digital excellence.
          </motion.p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActive(dept)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                  active === dept
                    ? "gradient-brand text-white shadow-glow"
                    : "border border-white/15 text-white/55 hover:text-white hover:border-white/35"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Photo */}
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,15,30,0.9)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white/80 text-xs leading-relaxed line-clamp-3">{member.bio}</p>
                    <div className="flex gap-2 mt-3">
                      <a href={member.linkedin} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-[#0066FF] transition-colors">
                        <Linkedin className="w-4 h-4 text-white" />
                      </a>
                      <a href={member.twitter} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-[#0066FF] transition-colors">
                        <Twitter className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <span className="text-[#00E5FF] text-[10px] font-bold tracking-widest uppercase">{member.department}</span>
                  <h3 className="text-white font-bold mt-1">{member.name}</h3>
                  <p className="text-white/55 text-xs">{member.position}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
