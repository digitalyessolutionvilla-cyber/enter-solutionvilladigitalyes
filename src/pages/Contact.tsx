import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const officeInfo = [
  { icon: MapPin, label: "Address", value: "14 Marina Street, Victoria Island, Lagos, Nigeria" },
  { icon: Phone, label: "Phone", value: "+234 800 000 0000" },
  { icon: Mail, label: "Email", value: "hello@solutionvilla.com" },
  { icon: Clock, label: "Hours", value: "Mon–Fri: 8AM – 6PM WAT" },
];

const subjects = ["General Inquiry", "Branding & Design", "Website Development", "Mobile App", "Digital Marketing", "Event Production", "Business Consulting", "Other"];

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert([form]);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Message sent!", description: "We'll be in touch within 24 hours." });
    }
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(0,229,255,0.1) 0%, transparent 65%)" }} />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase block mb-4">
            Contact Us
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
            Let's <span className="gradient-text">Build Together</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-xl">
            Ready to transform your business? Send us a message and we'll respond within 24 hours.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-card rounded-2xl p-8">
                {submitted ? (
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow-lg"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-white font-black text-2xl mb-3">Message Sent!</h3>
                    <p className="text-white/60">We'll be in touch within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                      className="mt-6 text-[#0066FF] text-sm hover:text-[#00E5FF] transition-colors font-medium"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-white font-black text-2xl mb-6">Send Us a Message</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm font-semibold block mb-1.5">Full Name *</label>
                        <input
                          name="name" value={form.name} onChange={handleChange} required
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm font-semibold block mb-1.5">Email *</label>
                        <input
                          name="email" value={form.email} onChange={handleChange} required type="email"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm font-semibold block mb-1.5">Phone</label>
                        <input
                          name="phone" value={form.phone} onChange={handleChange}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm font-semibold block mb-1.5">Subject</label>
                        <select
                          name="subject" value={form.subject} onChange={handleChange}
                          className="w-full bg-[#0A2540] border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all"
                        >
                          <option value="">Select subject</option>
                          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm font-semibold block mb-1.5">Message *</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange} required rows={5}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.15)] transition-all resize-none"
                        placeholder="Tell us about your project..."
                      />
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="w-full gradient-brand text-white font-bold py-4 rounded-full btn-glow hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-base"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Send className="w-5 h-5" /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Office Info */}
            <motion.div
              className="md:col-span-2 flex flex-col gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-card rounded-2xl p-8 flex-1">
                <h3 className="text-white font-black text-xl mb-6">Our Office</h3>
                <div className="space-y-5">
                  {officeInfo.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(0,102,255,0.15)] border border-[rgba(0,102,255,0.3)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#00E5FF]" />
                      </div>
                      <div>
                        <p className="text-white/45 text-xs font-medium mb-0.5">{label}</p>
                        <p className="text-white text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/8">
                  <p className="text-white/45 text-xs font-bold uppercase tracking-wider mb-3">Follow Us</p>
                  <div className="flex gap-2">
                    {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                      <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-white/60 hover:gradient-brand hover:text-white hover:border-transparent transition-all duration-200">
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="glass-card rounded-2xl overflow-hidden h-48">
                <div className="w-full h-full bg-gradient-to-br from-[rgba(0,102,255,0.1)] to-[rgba(0,229,255,0.05)] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-[#00E5FF] mx-auto mb-2" />
                    <p className="text-white/50 text-sm">Victoria Island, Lagos</p>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] text-xs mt-1 hover:text-[#00E5FF] transition-colors block">
                      Open in Maps →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
