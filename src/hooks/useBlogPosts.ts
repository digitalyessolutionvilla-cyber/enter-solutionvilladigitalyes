import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { blogPosts as fallback } from "@/lib/data";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: string;
  featured_image: string | null;
  status: string;
  featured: boolean;
  author: string | null;
  views: number;
  created_at: string;
}

export function useBlogPosts(publishedOnly = true): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, featured_image, status, featured, author, views, created_at")
      .order("created_at", { ascending: false });

    if (publishedOnly) query = query.eq("status", "published");

    query.then(({ data }) => {
      if (data && data.length > 0) {
        setPosts(data as BlogPost[]);
      } else {
        // Fallback to static data
        setPosts(
          fallback.map((p, i) => ({
            id: String(i),
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            body: null,
            category: p.category,
            featured_image: (p as { image?: string }).image || null,
            status: "published",
            featured: p.featured ?? false,
            author: (p as { author?: string }).author || null,
            views: 0,
            created_at: new Date().toISOString(),
          }))
        );
      }
    });
  }, [publishedOnly]);

  return posts;
}
