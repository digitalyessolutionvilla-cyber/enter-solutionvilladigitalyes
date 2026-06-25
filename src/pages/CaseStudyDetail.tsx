import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, TrendingUp, Images } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  industry: string | null;
  cover_image: string | null;
  problem: string | null;
  solution: string | null;
  results: string | null;
  testimonial: string | null;
  testimonial_author: string | null;
  status: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [study, setStudy] = useState<CaseStudy | null | undefined>(undefined); // undefined = loading
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setStudy(null); return; }

    supabase
      .from("case_studies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setStudy(data ?? null);
        if (data?.id) {
          supabase
            .from("case_study_gallery")
            .select("id, image_url, caption, sort_order")
            .eq("case_study_id", data.id)
            .order("sort_order")
            .then(({ data: imgs }) => setGallery(imgs ?? []));
        }
      });
  }, [slug]);

  // Loading state
  if (study === undefined) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading case study...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 404 state
  if (!study) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <p className="gradient-text text-6xl font-black mb-4">404</p>
            <h1 className="text-white font-bold text-2xl mb-4">Case Study Not Found</h1>
            <Link to="/case-studies" className="text-[#D4AF37] hover:text-[#F5D76E] transition-colors">
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, transparent 65%)" }} />
        <div className="container-custom relative z-10 max-w-5xl pb-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/case-studies" className="inline-flex items-center gap-2 text-white/50 hover:text-[#F5D76E] text-sm transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Case Studies
            </Link>

            {study.industry && (
              <div className="flex items-center gap-3 mb-4">
                <span className="gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">{study.industry}</span>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{study.title}</h1>

            <div className="flex items-center gap-2 text-white/55 text-sm">
              <Building2 className="w-4 h-4 text-[#F5D76E]" />
              <span>Client: <strong className="text-white">{study.client}</strong></span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {study.cover_image && (
        <div className="container-custom max-w-5xl">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            src={study.cover_image}
            alt={study.title}
            className="w-full rounded-2xl aspect-video object-cover"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-14">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Challenge", content: study.problem, color: "border-red-500/30" },
              { title: "Our Solution", content: study.solution, color: "border-[#D4AF37]/40" },
              { title: "The Results", content: study.results, color: "border-green-500/30" },
            ].filter((s) => s.content).map((section) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`glass-card rounded-2xl p-6 border-t-2 ${section.color}`}
              >
                <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#F5D76E]" />
                  {section.title}
                </h3>
                <p className="text-white/65 leading-relaxed text-sm">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          {study.testimonial && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 glass-card rounded-2xl p-8 border border-[rgba(212,175,55,0.2)] text-center"
            >
              <blockquote className="text-white/75 text-lg italic leading-relaxed mb-4">
                "{study.testimonial}"
              </blockquote>
              {study.testimonial_author && (
                <cite className="text-[#D4AF37] text-sm font-semibold not-italic">— {study.testimonial_author}</cite>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="pb-16">
          <div className="container-custom max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Images className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-white font-black text-2xl">Project Gallery</h2>
                <span className="text-white/25 text-sm">({gallery.length} images)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((img, i) => (
                  <motion.button
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setLightbox(img.image_url)}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-white/8 hover:border-[rgba(212,175,55,0.4)] transition-all duration-300"
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption ?? `Gallery image ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Images className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{img.caption}</p>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={lightbox}
            alt="Gallery"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors text-xl font-light"
          >
            ×
          </button>
        </div>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="container-custom max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 text-center"
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
