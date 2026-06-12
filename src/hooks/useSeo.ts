import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSeo(pagePath: string) {
  useEffect(() => {
    const fetchSeo = async () => {
      const { data } = await supabase
        .from("seo_settings")
        .select("*")
        .eq("page_path", pagePath)
        .maybeSingle();

      if (!data) return;

      // Update document title
      if (data.meta_title) {
        document.title = data.meta_title;
      }

      const setMeta = (name: string, content: string | null | undefined, property = false) => {
        if (!content) return;
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(selector) as HTMLMetaElement;
        if (!el) {
          el = document.createElement("meta");
          if (property) el.setAttribute("property", name);
          else el.setAttribute("name", name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };

      setMeta("description", data.meta_description);
      setMeta("og:title", data.og_title || data.meta_title, true);
      setMeta("og:description", data.og_description || data.meta_description, true);
      if (data.og_image) setMeta("og:image", data.og_image, true);
      if (data.no_index) setMeta("robots", "noindex,nofollow");
    };

    fetchSeo();
  }, [pagePath]);
}
