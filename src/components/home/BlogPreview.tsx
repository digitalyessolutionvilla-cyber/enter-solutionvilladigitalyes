import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, User } from "lucide-react";
import { blogPosts } from "@/lib/data";

export default function BlogPreview() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-3 block">
            Insights
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Latest from the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            Thought leadership, industry trends, and expert insights from our team.
          </p>
        </motion.div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="text-white font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#00E5FF] transition-colors duration-150">
                  {post.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed line-clamp-3 mb-5">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-white/8 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-white/45 text-xs">
                      <User className="w-3.5 h-3.5" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/45 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-200"
          >
            Read All Articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
