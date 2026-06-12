import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, User, ArrowRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { blogPosts } from "@/lib/data";

const categories = ["All", "Digital Marketing", "Branding", "Technology", "Business", "Africa"];

export default function Blog() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = blogPosts.filter((p) => {
    const matchesCat = active === "All" || p.category === active;
    const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const featured = blogPosts.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || active !== "All" || query !== "");

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.12) 0%, transparent 65%)" }} />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#F5D76E] text-xs font-bold tracking-widest uppercase block mb-4">
            Blog
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white mb-5">
            Insights & <span className="gradient-text">Innovation</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/60 text-xl">
            Thought leadership, trends, and practical advice for Africa's digital economy.
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
                placeholder="Search articles..."
                className="w-full bg-white/5 border border-white/15 rounded-full pl-10 pr-4 py-2.5 text-white placeholder-white/35 text-sm outline-none focus:border-[#F5D76E] focus:ring-2 focus:ring-[rgba(245,215,110,0.15)] transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
                    active === cat
                      ? "gradient-brand text-white shadow-glow"
                      : "border border-white/15 text-white/55 hover:text-white hover:border-white/35"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featured && active === "All" && query === "" && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group glass-card rounded-2xl overflow-hidden mb-10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="md:flex">
                <div className="md:w-1/2 relative overflow-hidden aspect-video md:aspect-auto">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Featured · {featured.category}
                  </span>
                </div>
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                  <h2 className="text-white font-black text-2xl md:text-3xl mb-4 leading-snug group-hover:text-[#F5D76E] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-white/60 leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-white/45 text-sm mb-6">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{featured.author}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featured.readTime}</span>
                  </div>
                  <Link to={`/blog/${featured.slug}`} className="flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-full btn-glow w-fit hover:scale-105 transition-all duration-200">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Posts grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(active !== "All" || query !== "" ? filtered : rest).map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 gradient-brand text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#F5D76E] transition-colors">{post.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-white/8 pt-4">
                    <div className="flex items-center gap-3 text-white/45 text-xs">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="text-[#D4AF37] text-xs font-semibold hover:text-[#F5D76E] transition-colors">
                      Read →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-20 text-lg">No articles found.</div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
