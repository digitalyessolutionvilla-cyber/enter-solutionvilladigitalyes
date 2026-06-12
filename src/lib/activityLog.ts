import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: "created" | "updated" | "deleted" | "published" | "archived" | "invited" | "viewed",
  entity_type: string,
  entity_id: string,
  entity_title: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type,
      entity_id,
      entity_title,
      details: details ?? {},
    });
  } catch {
    // Silently fail — logging should never break app flow
  }
}
