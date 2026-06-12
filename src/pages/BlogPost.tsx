import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, Tag } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBlogPosts } from "@/hooks/useBlogPosts";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string;
  featured_image: string | null;
  status: string;
  author: string | null;
  views: number;
  created_at: string;
}

function renderBody(body: string) {
  // Simple markdown-like renderer for headings, paragraphs, bold
  return body.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-white font-bold text-2xl mt-10 mb-4">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="text-white font-bold text-xl mt-8 mb-3">
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1 key={i} className="text-white font-black text-3xl mt-10 mb-4">
          {line.replace("# ", "")}
        </h1>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    // Bold inline: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-white/65 leading-8 text-base mb-4">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white/85 font-semibold">{part}</strong> : part
        )}
      </p>
    );
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined = loading
  const relatedPosts = useBlogPosts(true);

  useEffect(() => {
    if (!slug) { setPost(null); return; }
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as BlogPost | null);
        // Increment views
        if (data) {
          supabase
            .from("blog_posts")
            .update({ views: (data.views ?? 0) + 1 })
            .eq("id", data.id)
            .then(() => {});
        }
      });
  }, [slug]);

  // Loading
  if (post === undefined) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-white/40">Loading article...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Not found
  if (!post) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <p className="gradient-text text-6xl font-black mb-4">404</p>
            <h1 className="text-white font-bold text-2xl mb-4">Article Not Found</h1>
            <p className="text-white/40 mb-6">This article may have been removed or the URL is incorrect.</p>
            <Link to="/blog" className="text-[#D4AF37] hover:text-[#F5D76E] transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const related = relatedPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 2);
  const fallbackRelated = relatedPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-0 overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(212,175,55,0.12) 0%, transparent 60%)" }} />
        <div className="container-custom relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[#F5D76E] text-sm transition-colors mb-6">
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
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#F5D76E]" />{post.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#F5D76E]" />
                {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#F5D76E]" />{post.category}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {post.featured_image && (
        <div className="container-custom max-w-4xl mb-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <img src={post.featured_image} alt={post.title} className="w-full rounded-2xl aspect-video object-cover mt-8" />
          </motion.div>
        </div>
      )}

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {post.excerpt && (
              <p className="text-white/75 text-xl leading-relaxed mb-8 font-light border-l-2 border-[#D4AF37] pl-5">
                {post.excerpt}
              </p>
            )}

            <div className="prose prose-invert max-w-none">
              {post.body ? renderBody(post.body) : (
                <p className="text-white/50 italic">No content available for this article.</p>
              )}
            </div>
          </motion.div>

          {/* Related Posts */}
          {(related.length > 0 || fallbackRelated.length > 0) && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <h2 className="text-white font-black text-2xl mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {(related.length > 0 ? related : fallbackRelated).map((rel) => (
                  <Link key={rel.id} to={`/blog/${rel.slug}`} className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                    {rel.featured_image && (
                      <img src={rel.featured_image} alt={rel.title} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="p-5">
                      <span className="text-[#F5D76E] text-[10px] font-bold tracking-widest uppercase">{rel.category}</span>
                      <h3 className="text-white font-bold mt-1 line-clamp-2 group-hover:text-[#F5D76E] transition-colors">{rel.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
