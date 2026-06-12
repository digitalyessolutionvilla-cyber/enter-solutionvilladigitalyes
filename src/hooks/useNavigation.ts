import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { navLinks as fallbackNav } from "@/lib/data";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
  nav_area: string;
  footer_column?: string | null;
  children?: NavItem[];
}

export function useNavigation(area: "header" | "footer" = "header"): NavItem[] {
  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    supabase
      .from("navigation_items")
      .select("*")
      .eq("is_active", true)
      .eq("nav_area", area)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const topLevel = data.filter((i: NavItem) => !i.parent_id);
          const withChildren = topLevel.map((item: NavItem) => ({
            ...item,
            children: data.filter((c: NavItem) => c.parent_id === item.id),
          }));
          setItems(withChildren);
        } else if (area === "header") {
          // Fallback to data.ts navLinks
          setItems(
            fallbackNav.map((l, idx) => ({
              id: String(idx),
              label: l.label,
              href: l.href,
              parent_id: null,
              sort_order: idx,
              is_active: true,
              opens_new_tab: false,
              nav_area: "header",
            }))
          );
        }
      });
  }, [area]);

  return items;
}

export function useFooterNavigation(): Record<string, NavItem[]> {
  const [grouped, setGrouped] = useState<Record<string, NavItem[]>>({});

  useEffect(() => {
    supabase
      .from("navigation_items")
      .select("*")
      .eq("is_active", true)
      .eq("nav_area", "footer")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const g: Record<string, NavItem[]> = {};
          data.forEach((item: NavItem) => {
            const col = item.footer_column || "other";
            if (!g[col]) g[col] = [];
            g[col].push(item);
          });
          setGrouped(g);
        }
      });
  }, []);

  return grouped;
}
