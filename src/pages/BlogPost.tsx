import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, Tag } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { blogPosts } from "@/lib/data";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <p className="gradient-text text-6xl font-black mb-4">404</p>
            <h1 className="text-white font-bold text-2xl mb-4">Article Not Found</h1>
            <Link to="/blog" className="text-[#0066FF] hover:text-[#00E5FF] transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-0 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(0,102,255,0.12) 0%, transparent 60%)" }} />
        <div className="container-custom relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[#00E5FF] text-sm transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-white/45 text-sm mb-8 pb-8 border-b border-white/10">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-[#00E5FF]" />{post.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#00E5FF]" />{post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#00E5FF]" />{post.readTime}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      <div className="container-custom max-w-4xl mb-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <img src={post.image} alt={post.title} className="w-full rounded-2xl aspect-video object-cover mt-8" />
        </motion.div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-white/75 text-xl leading-relaxed mb-8 font-light">{post.excerpt}</p>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/65 leading-8 text-base mb-6">
                Africa's digital landscape is rapidly evolving, and organizations that fail to adapt risk being left behind in an increasingly competitive marketplace. From Lagos to Nairobi, Accra to Cape Town, businesses are discovering that a robust digital strategy is no longer optional — it's the foundation upon which sustainable growth is built.
              </p>
              <p className="text-white/65 leading-8 text-base mb-6">
                The key trends shaping this transformation include the explosive growth of mobile-first commerce, the rise of social commerce across platforms like TikTok and Instagram, the increasing sophistication of African consumers, and the expanding role of artificial intelligence in marketing automation.
              </p>
              <h2 className="text-white font-bold text-2xl mt-10 mb-4">What Does This Mean for African Businesses?</h2>
              <p className="text-white/65 leading-8 text-base mb-6">
                For organizations looking to capture market share in Africa's growing digital economy, the message is clear: invest in authentic storytelling, mobile-optimized experiences, and data-driven decision making. Brands that understand their local context while embracing global best practices will be the ones that thrive.
              </p>
              <p className="text-white/65 leading-8 text-base">
                At Solution Villa, we've seen firsthand how transformative a well-executed digital strategy can be. Companies that partner with us don't just get services — they get a team committed to their long-term success.
              </p>
            </div>
          </motion.div>

          {/* Related Posts */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-white font-black text-2xl mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {blogPosts.filter((p) => p.slug !== slug).slice(0, 2).map((related) => (
                <Link key={related.id} to={`/blog/${related.slug}`} className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  <img src={related.image} alt={related.title} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="p-5">
                    <span className="text-[#00E5FF] text-[10px] font-bold tracking-widest uppercase">{related.category}</span>
                    <h3 className="text-white font-bold mt-1 line-clamp-2 group-hover:text-[#00E5FF] transition-colors">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
