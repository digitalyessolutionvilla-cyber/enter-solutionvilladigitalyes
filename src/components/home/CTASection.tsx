import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-brand opacity-10" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,102,255,0.2) 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderTop: "1px solid rgba(0,102,255,0.2)",
          borderBottom: "1px solid rgba(0,102,255,0.2)",
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-glow-lg animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="gradient-text">Your Business?</span>
          </h2>

          <p className="text-white/60 text-xl mb-10 leading-relaxed">
            Let's build something extraordinary together. Our team is ready to bring your vision to life with world-class digital solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="flex items-center gap-2 gradient-brand text-white font-bold text-lg px-10 py-5 rounded-full btn-glow hover:scale-105 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              Let's Build Something Amazing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/case-studies"
              className="text-white/70 font-medium hover:text-[#00E5FF] transition-colors duration-150 text-base"
            >
              View Case Studies →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            {["200+ Projects", "98% Client Satisfaction", "8+ Years Experience", "50+ Team Members"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/45 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
