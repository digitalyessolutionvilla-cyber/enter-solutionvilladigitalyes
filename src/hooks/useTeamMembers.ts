import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { teamMembers as fallback } from "@/lib/data";

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  bio: string | null;
  photo_url: string | null;
  linkedin: string | null;
  twitter: string | null;
  sort_order: number;
  status: string;
}

export function useTeamMembers(): TeamMember[] {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    supabase
      .from("team_members")
      .select("*")
      .eq("status", "active")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          // Fallback to static data mapped to interface
          setMembers(
            fallback.map((m, i) => ({
              id: String(i),
              name: m.name,
              position: m.position,
              department: m.department,
              bio: m.bio,
              photo_url: (m as { photo?: string }).photo || null,
              linkedin: m.linkedin,
              twitter: m.twitter,
              sort_order: i,
              status: "active",
            }))
          );
        }
      });
  }, []);

  return members;
}
