import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches a page section's content from the DB.
 * Returns the fallback immediately, then silently replaces with DB data.
 * This ensures zero layout shift on the public site.
 */
export function usePageSection<T>(
  pagePath: string,
  sectionKey: string,
  fallback: T
): T {
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    supabase
      .from("page_sections")
      .select("content")
      .eq("page_path", pagePath)
      .eq("section_key", sectionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          setContent(data.content as T);
        }
      });
  }, [pagePath, sectionKey]);

  return content;
}
