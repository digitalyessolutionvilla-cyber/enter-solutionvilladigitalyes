# Staff Roles & Permissions — Plan

## Context
The Users admin page already lets a Super Admin invite staff and assign **Admin** / **Super Admin** roles (via the `invite-user` backend function), but both roles currently get identical full CMS access. The user wants granular staff roles:
- **Content Editor** — Blog, Portfolio, Case Studies, Testimonials, Team, Content Editor (page sections), Services
- **Support** — Inquiries, Newsletter, Live Chat

Restricted roles must be enforced for real (RLS in the database), not just hidden in the sidebar — direct URL access and direct API calls must also be blocked, per the security ground rules for this project.

Today almost every CMS table uses a blanket `auth.role() = 'authenticated'` policy — meaning any logged-in staff member (regardless of intended role) can already read/write every table directly via the API. This plan replaces those blanket checks with role-scoped checks so DB access matches the UI restrictions exactly.

---

## Design

### 1. Roles
Extend `user_profiles.role` to 4 values: `super_admin`, `admin`, `content_editor`, `support`.
- `super_admin` / `admin` — unchanged, full access to everything (as today)
- `content_editor` — content tables only
- `support` — support tables only

### 2. Database helper function
```sql
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r text;
BEGIN
  SELECT role INTO r FROM public.user_profiles WHERE id = auth.uid();
  RETURN r;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$;
```

### 3. RLS policy updates (single migration)
Replace existing `auth.role() = 'authenticated'` admin policies with `current_user_role() IN (...)`:

| Scope | Tables | Allowed roles |
|---|---|---|
| Content | `blog_posts`, `portfolio_items`, `portfolio_images`, `case_studies`, `case_study_gallery`, `testimonials`, `team_members`, `page_sections`, `services`, `media_files` (insert/select/delete) | `super_admin`, `admin`, `content_editor` |
| Support | `contact_submissions` (select/update), `newsletter_subscribers`, `newsletter_campaigns`, `chat_leads`, `chat_messages` | `super_admin`, `admin`, `support` |
| Full-admin only | `navigation_items`, `seo_settings`, `site_settings`, `hero_slides`, `activity_logs` (select only; insert stays open to any authenticated staff so actions can still be logged) | `super_admin`, `admin` |

`user_profiles` policies (`auth.uid() = id` for own row, `is_super_admin()` for cross-user) stay unchanged — every role must still read its own profile to log in.

Also update the `user_profiles_role_check` CHECK constraint to allow the 2 new role values.

### 4. Frontend permission matrix
New file `src/lib/adminPermissions.ts`:
```ts
export type StaffRole = "super_admin" | "admin" | "content_editor" | "support";
export const CONTENT_ROLES: StaffRole[] = ["super_admin", "admin", "content_editor"];
export const SUPPORT_ROLES: StaffRole[] = ["super_admin", "admin", "support"];
export const FULL_ADMIN_ROLES: StaffRole[] = ["super_admin", "admin"];
export const SUPER_ADMIN_ONLY: StaffRole[] = ["super_admin"];
```

### 5. Route protection
`src/components/admin/ProtectedRoute.tsx` gets an optional `roles?: StaffRole[]` prop:
- If provided and `profile` hasn't loaded yet (but user is authenticated) → show the existing spinner (avoids a false "Access Restricted" flash). Requires adding a `profileLoading` flag to `AuthContext` that flips false once the first profile fetch resolves.
- If provided and loaded `profile.role` is not included → render a shared `AccessRestricted` component (extracted from the existing pattern in `Users.tsx`).
- If omitted → any authenticated user passes (used only for Dashboard).

`src/router.tsx` — wrap each admin route with the matching `roles` array from the matrix above (content routes → `CONTENT_ROLES`, support routes → `SUPPORT_ROLES`, site/system routes → `FULL_ADMIN_ROLES`, `/admin/users` → `SUPER_ADMIN_ONLY`, dashboard → none).

### 6. Sidebar
`src/components/admin/AdminLayout.tsx` — add `roles?: StaffRole[]` to each `navItems` entry (omit = visible to all, i.e. Dashboard only). Filter items by `profile.role`; suppress a section divider if none of its children are visible for the current role.

### 7. Users page & invite flow
- `src/pages/admin/Users.tsx` — extend role badge styles/icons for `content_editor` (e.g. `FileEdit` icon) and `support` (e.g. `Headphones` icon); update both the invite-form role `<select>` and the per-row role-change `<select>` to offer all 4 roles; extract the "Access Restricted" block into `src/components/admin/AccessRestricted.tsx` and reuse it here too.
- `supabase/functions/invite-user/index.ts` — validate `role` against the 4 allowed values (400 if invalid); update the invite email's `displayRole` label mapping to include "Content Editor" / "Support".
- `src/context/AuthContext.tsx` — widen the `UserProfile.role` type to the 4-value union; add `profileLoading` state.

---

## Files Modified
| File | Change |
|---|---|
| `supabase/migrations/migration_*` | New role values, `current_user_role()` fn, RLS policy rewrites |
| `src/lib/adminPermissions.ts` | New — role constants |
| `src/components/admin/AccessRestricted.tsx` | New — shared restricted-access UI |
| `src/components/admin/ProtectedRoute.tsx` | Add `roles` prop + loading-aware gating |
| `src/context/AuthContext.tsx` | Widen role type, add `profileLoading` |
| `src/router.tsx` | Add `roles` prop per route |
| `src/components/admin/AdminLayout.tsx` | Add `roles` per nav item, filter sidebar |
| `src/pages/admin/Users.tsx` | 4-role badges/dropdowns, reuse `AccessRestricted` |
| `supabase/functions/invite-user/index.ts` | Validate role, update email labels |

---

## Implementation Checklist
- [passed] Migration: widen `user_profiles_role_check` to 4 roles
- [passed] Migration: create `current_user_role()` SECURITY DEFINER function
- [passed] Migration: rewrite content-table policies to `CONTENT_ROLES`
- [passed] Migration: rewrite support-table policies to `SUPPORT_ROLES`
- [passed] Migration: rewrite site/system-table policies (`navigation_items`, `seo_settings`, `site_settings`, `hero_slides`, `activity_logs` select) to `FULL_ADMIN_ROLES`
- [passed] `src/lib/adminPermissions.ts` created with role constants
- [passed] `AuthContext` — role type widened, `profileLoading` added
- [passed] `AccessRestricted` shared component created and used in `Users.tsx`
- [passed] `ProtectedRoute` — `roles` prop implemented with loading-aware gating
- [passed] `router.tsx` — every admin route annotated with correct `roles`
- [passed] `AdminLayout` — sidebar filtered by role, dividers hidden when empty
- [passed] `Users.tsx` — 4-role invite dropdown, 4-role row-level dropdown, badge styles/icons
- [passed] `invite-user` edge function — role validation + email label update

## Verification Checklist
- [manual-required] Super Admin can invite a user with role Content Editor and Support
- [manual-required] Content Editor login: sidebar shows only Dashboard + content items; Blog/Portfolio/etc. work end to end
- [manual-required] Content Editor navigating directly to `/admin/inquiries` or `/admin/settings` sees Access Restricted, not the page content
- [manual-required] Support login: sidebar shows only Dashboard + Inquiries/Newsletter/Live Chat; those pages work end to end
- [manual-required] Support navigating directly to `/admin/blog` sees Access Restricted
- [passed] Content Editor calling `supabase.from("contact_submissions").select()` directly (e.g. via browser console) is blocked by RLS
- [passed] Support calling `supabase.from("blog_posts").insert()` directly is blocked by RLS
- [passed] Existing Admin/Super Admin accounts retain full access to every section (no regression)
- [passed] `pnpm` lint passes with 0 errors after all file changes
