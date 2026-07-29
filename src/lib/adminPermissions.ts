// Staff role permission matrix.
// Mirrors the RLS scopes enforced in the database
// (see supabase/migrations/migration_20260729_120000000).

export type StaffRole = "super_admin" | "admin" | "content_editor" | "support";

/** Content tables: Blog, Portfolio, Case Studies, Testimonials, Team,
 *  Content Editor (page sections), Services, Media. */
export const CONTENT_ROLES: StaffRole[] = ["super_admin", "admin", "content_editor"];

/** Support tables: Inquiries, Newsletter, Live Chat. */
export const SUPPORT_ROLES: StaffRole[] = ["super_admin", "admin", "support"];

/** Site / system tables: Navigation, SEO, Settings, Hero Slides, Activity Logs. */
export const FULL_ADMIN_ROLES: StaffRole[] = ["super_admin", "admin"];

/** User management. */
export const SUPER_ADMIN_ONLY: StaffRole[] = ["super_admin"];

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  content_editor: "Content Editor",
  support: "Support",
};

export const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  super_admin: "Full access to everything, including user management.",
  admin: "Full access to all CMS content, support, and settings.",
  content_editor: "Blog, Portfolio, Case Studies, Testimonials, Team, Content, Services.",
  support: "Inquiries, Newsletter, and Live Chat.",
};

/** True if `role` is permitted by an allow-list. Omitted allow-list = any staff. */
export function hasRole(role: StaffRole | undefined | null, allowed: StaffRole[] | undefined): boolean {
  if (!allowed) return true;
  return role != null && allowed.includes(role);
}
