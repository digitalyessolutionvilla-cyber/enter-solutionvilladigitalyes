import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { caseStudies as fallback } from "@/lib/data";

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  industry: string | null;
  cover_image: string | null;
  problem: string | null;
  solution: string | null;
  results: string | null;
  status: string;
  created_at: string;
}

export function useCaseStudies(): CaseStudy[] {
  const [items, setItems] = useState<CaseStudy[]>([]);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("id, title, slug, client, industry, cover_image, problem, solution, results, status, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setItems(data as CaseStudy[]);
        } else {
          setItems(
            fallback.map((c, i) => ({
              id: String(i),
              title: c.title,
              slug: c.slug,
              client: c.client,
              industry: c.industry,
              cover_image: (c as { cover?: string }).cover || null,
              problem: c.problem,
              solution: c.solution,
              results: c.results,
              status: "published",
              created_at: new Date().toISOString(),
            }))
          );
        }
      });
  }, []);

  return items;
}
