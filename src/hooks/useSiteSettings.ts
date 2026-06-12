import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings(): Record<string, string> {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((s) => { if (s.value) map[s.key] = s.value; });
          setSettings(map);
        }
      });
  }, []);

  return settings;
}
