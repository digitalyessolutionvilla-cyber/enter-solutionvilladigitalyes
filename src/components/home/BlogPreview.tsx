import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { blogPosts } from "@/lib/data";

export default function BlogPreview() {
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="section-padding bg-[#0A0A0A] relative overflow-hidden">
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block">Insights</span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white">
              Premium <span className="gradient-text">Knowledge</span>
            </h2>
          </div>
          <Link
            to="/blog"
            className="flex items-center gap-2 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[rgba(212,175,55,0.1)] transition-all duration-200 self-start md:self-auto whitespace-nowrap"
          >
            All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="luxury-divider mb-12" style={{ margin: "0 0 3rem 0" }} />

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex flex-col h-full glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.35)] text-[#F5D76E] text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 p-6 flex-1">
                  <h3 className="text-white font-display font-bold text-lg leading-snug group-hover:text-[#F5D76E] transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(212,175,55,0.08)]">
                    <span className="text-white/30 text-xs">{post.readTime} min read · {post.author}</span>
                    <ExternalLink className="w-4 h-4 text-[#D4AF37]/40 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
