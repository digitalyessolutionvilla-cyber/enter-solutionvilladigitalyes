# Solution Villa — Secure CMS Backend Plan

## Context
Enhancing the existing admin panel (at `/admin/*`) into a full-featured, secure CMS with role-based access, media management, activity auditing, SEO control, dynamic navigation, user management, site content editing, and an analytics dashboard. All content updates persist in the database and instantly reflect on the public frontend.

---

## Existing Foundation (Do Not Break)
- `src/pages/admin/` — 10 existing admin pages (Blog, Portfolio, CaseStudies, Team, Testimonials, Inquiries, Users stub, Settings stub, Dashboard, Login)
- `src/components/admin/AdminLayout.tsx` — collapsible sidebar + topbar
- `src/components/admin/ProtectedRoute.tsx` — auth guard
- `src/context/AuthContext.tsx` — session + profile + RBAC (super_admin / admin)
- Database: 7 tables already exist (contact_submissions, blog_posts, portfolio_items, case_studies, team_members, testimonials, user_profiles)

---

## New Database Tables (single migration)

| Table | Purpose |
|---|---|
| `media_files` | Cloud storage file metadata (url, type, size, created_by) |
| `activity_logs` | Audit trail: who did what, when, on which entity |
| `seo_settings` | Per-page meta title, description, OG image (keyed by page_path) |
| `navigation_items` | Dynamic menu links with parent/child (submenu) support |
| `site_settings` | Key-value store for all site-wide settings (persists to DB) |
| `page_sections` | JSON content blocks for editable homepage/about sections |

**RLS policies:** Public read where appropriate; authenticated write for all; super_admin-only for sensitive tables.

**Supabase Storage:** Create a public `media` bucket for file uploads.

---

## New Edge Function
- `invite-user` — Supabase admin API call to create a new user account by email (super_admin only). Returns a temporary password / triggers password reset email.

---

## New Shared Utility
- `src/lib/activityLog.ts` — `logActivity(supabase, action, entity_type, entity_id, details)` helper used by all admin pages on CRUD operations.

---

## New Admin Pages (8 new pages)

### 1. `/admin/media` — Media Library (`MediaLibrary.tsx`)
- Upload images/files drag-and-drop or click → Supabase Storage `media` bucket
- Grid view of all uploaded files with name, size, type, date
- Copy URL to clipboard, preview, delete
- Filter by type (images / documents / video)

### 2. `/admin/activity-logs` — Activity Logs (`ActivityLogs.tsx`)
- Table of all admin actions (created/updated/deleted entity_type by user at time)
- Filters: by user, by action type, by date range
- Super Admin sees all; Admin sees only own actions
- Auto-populated by `logActivity()` helper in all CRUD pages

### 3. `/admin/seo` — SEO Settings (`SeoSettings.tsx`)
- Table of all pages: Home, About, Blog, Portfolio, Case Studies, Team, Contact
- Edit meta_title, meta_description, og_image, og_title per page
- Changes saved to `seo_settings` table
- Frontend: each public page reads from `seo_settings` and injects into `<head>` via a `useSeo()` hook

### 4. `/admin/navigation` — Navigation Manager (`NavigationAdmin.tsx`)
- CRUD for navigation items (label, href, sort_order, parent_id for submenus, is_active)
- Drag-to-reorder (via simple up/down buttons)
- Frontend Navbar reads from `navigation_items` table (falls back to static data)

### 5. `/admin/pages` — Site Content Editor (`PageEditor.tsx`)
- Edit key content sections stored in `page_sections`:
  - Hero: headline, subheadline, CTA text, CTA link
  - About: mission, vision text
  - Stats: 4 stat labels and values
  - Services: list of service titles/descriptions
  - Contact: address, phone, email, map embed URL
- Rich text with simple toolbar (bold, italic, lists) via native contenteditable or textarea
- "Save & Preview" button opens public site in new tab

### 6. `/admin/users` — Full User Management (`Users.tsx` rewrite)
- Table of all users from `user_profiles` JOIN auth metadata
- Change role (admin ↔ super_admin)  
- Deactivate/reactivate accounts
- "Invite New Admin" modal: enter email → calls `invite-user` edge function → sends invite email
- Super Admin only; admins see access-denied screen (unchanged)

### 7. `/admin/settings` — DB-Backed Settings (`Settings.tsx` rewrite)
- Load from `site_settings` table on mount
- Save to `site_settings` table on submit
- Sections: General (name, tagline), Contact info, Social media links, WhatsApp number, Business hours

### 8. `/admin/analytics` — Analytics Dashboard (enhanced `Dashboard.tsx`)
- Existing stat cards remain
- Add: contact submissions by week (bar chart), blog views by post (horizontal bar), portfolio by category (donut)
- Use lightweight `recharts` library for charts
- Export inquiries as CSV button

---

## Modified Existing Files

### `src/components/admin/AdminLayout.tsx`
Add new nav items:
- Media Library (Image icon)
- Navigation (Menu icon)  
- Pages / Content (Layout icon)
- SEO Settings (Search icon)
- Analytics (BarChart icon)
- Activity Logs (Clock icon)
- Users (moved with super_admin badge)

### `src/router.tsx`
Add 6 new protected routes for the new pages.

### Existing CRUD Pages (Blog, Portfolio, CaseStudies, Team, Testimonials, Inquiries)
- Add `logActivity()` call after every create/update/delete operation
- Add "Pick from Media Library" button on image URL fields (opens media picker modal)

### Public Pages (Index, About, Blog, BlogPost, Contact)
- Add `useSeo(pagePath)` hook that fetches from `seo_settings` and updates `<head>` meta tags
- Content sections read from `page_sections` with static fallback

---

## File List

**New files:**
```
supabase/functions/invite-user/index.ts
src/lib/activityLog.ts
src/hooks/useSeo.ts
src/components/admin/MediaPickerModal.tsx
src/pages/admin/MediaLibrary.tsx
src/pages/admin/ActivityLogs.tsx
src/pages/admin/SeoSettings.tsx
src/pages/admin/NavigationAdmin.tsx
src/pages/admin/PageEditor.tsx
```

**Modified files:**
```
src/components/admin/AdminLayout.tsx        (add nav items)
src/router.tsx                               (add 5 new routes)
src/pages/admin/Users.tsx                   (full rewrite)
src/pages/admin/Settings.tsx                (DB-backed rewrite)
src/pages/admin/Dashboard.tsx               (add charts, CSV export)
src/pages/admin/BlogAdmin.tsx               (add logActivity + media picker)
src/pages/admin/PortfolioAdmin.tsx          (add logActivity + media picker)
src/pages/admin/TeamAdmin.tsx               (add logActivity)
src/pages/admin/TestimonialsAdmin.tsx       (add logActivity)
src/pages/admin/CaseStudiesAdmin.tsx        (add logActivity)
```

---

## Security Model

| Role | Capabilities |
|---|---|
| `super_admin` | All CMS features + user management + invite admins + view all activity logs |
| `admin` | Content CRUD (blog/portfolio/team/testimonials/case studies/inquiries) + media + own activity logs |
| Public | Read-only access to published content; no admin routes |

- All admin routes wrapped in `<ProtectedRoute>` (auth guard)
- Sensitive operations (user invite, role change) guarded by `isSuperAdmin` check in component + RLS on DB
- `invite-user` edge function validates caller's role server-side before creating new user

---

## Verification
1. Navigate to `/admin/login` → login works
2. Visit each new admin route → loads without error
3. Upload file in Media Library → appears in grid + URL is copyable
4. Create blog post → Activity Logs shows the entry
5. Edit SEO settings for Home → `<title>` tag updates in browser
6. Save a navigation item → Navbar on public site reflects change
7. Super Admin can invite user; Admin cannot access Users page
8. Dashboard charts render with live data
9. Settings save to DB (persist after page refresh)
