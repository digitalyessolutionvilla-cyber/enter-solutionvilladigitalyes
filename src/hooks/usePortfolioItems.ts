import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { portfolioItems as fallback } from "@/lib/data";

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  client: string | null;
  year: number | null;
  status: string;
  created_at: string;
}

export function usePortfolioItems(): PortfolioItem[] {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data as PortfolioItem[]);
        } else {
          setItems(
            fallback.map((p, i) => ({
              id: String(i),
              title: p.title,
              category: p.category,
              description: p.description,
              image_url: (p as { image?: string }).image || null,
              client: p.client,
              year: new Date().getFullYear(),
              status: "published",
              created_at: new Date().toISOString(),
            }))
          );
        }
      });
  }, []);

  return items;
}
