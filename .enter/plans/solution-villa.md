# Solution Villa CMS – Bug Fix & Data Integrity Plan

## Root Cause Summary

### Bug 1: Content Loss on Edit (BlogAdmin, PortfolioAdmin, CaseStudiesAdmin, TeamAdmin)
All four admin pages run a **minimal SELECT** for the list (missing body/bio/description fields).
When the Edit button is clicked, the handler only maps the fields available in the list result — leaving `body`, `excerpt`, `featured_image`, `bio`, `linkedin`, `twitter`, `description`, `problem`, `solution`, `results` silently reset to `""`.

**Fix**: On edit click, issue a `SELECT *` by ID to fetch the full record, then populate all form fields.

### Bug 2: Frontend Still Using Hardcoded data.ts
These pages import directly from `@/lib/data` — CMS changes have zero effect:
- `Blog.tsx` → `blogPosts`
- `Team.tsx` → `teamMembers`
- `Portfolio.tsx` → `portfolioItems`
- `CaseStudies.tsx` → `caseStudies`
- `About.tsx` → hardcoded `values[]` + `timeline[]` arrays + `teamMembers`

**Fix**: Create 4 new DB hooks + update each page to use them.

### Bug 3: NavigationAdmin Missing nav_area Field
The form has no Header/Footer selector. All new items default to `header`. Footer items created via migration are not editable/visible in the correct context.

**Fix**: Add nav_area + footer_column to the form.

### Bug 4: Hero Slides Cannot Be Assigned to Pages
No `page_path` column → sliders floating with no assignment.

**Fix**: Add `page_path` column via migration, update HeroSlidesAdmin form.

---

## Implementation Steps

### Step 1 – Database Migrations
```sql
-- Add page_path to hero_slides
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS page_path text DEFAULT '/';

-- Seed existing hardcoded data into DB tables (only if empty)
INSERT INTO team_members (name, position, department, bio, photo_url, linkedin, twitter, sort_order, status)
  SELECT ... FROM (VALUES ...) WHERE NOT EXISTS (SELECT 1 FROM team_members LIMIT 1);

INSERT INTO blog_posts (title, slug, excerpt, body, category, featured_image, status, featured, views)
  SELECT ... WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

INSERT INTO portfolio_items (title, category, description, image_url, client, year, status)
  SELECT ... WHERE NOT EXISTS (SELECT 1 FROM portfolio_items LIMIT 1);

INSERT INTO case_studies (title, slug, client, industry, cover_image, problem, solution, results, status)
  SELECT ... WHERE NOT EXISTS (SELECT 1 FROM case_studies LIMIT 1);
```

### Step 2 – Fix Edit Pre-population (4 admin pages)

**Pattern** (same for all):
```ts
const handleEdit = async (id: string) => {
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (data) { setForm({ title: data.title, slug: data.slug, excerpt: data.excerpt || "", body: data.body || "", ... }); }
  setEditingId(id);
  setShowForm(true);
};
```
- `BlogAdmin.tsx` – fetch full record including `body`, `excerpt`, `featured_image`
- `PortfolioAdmin.tsx` – fetch full record including `description`, `image_url`
- `CaseStudiesAdmin.tsx` – fetch full record including `problem`, `solution`, `results`, `cover_image`, `testimonial`, `testimonial_author`
- `TeamAdmin.tsx` – fetch full record including `bio`, `linkedin`, `twitter`

### Step 3 – Create 4 Frontend Data Hooks

**`src/hooks/useBlogPosts.ts`**
```ts
export function useBlogPosts(limit?: number) — reads blog_posts WHERE status='published' ORDER BY created_at DESC, falls back to data.ts blogPosts
```

**`src/hooks/usePortfolioItems.ts`**
```ts
export function usePortfolioItems() — reads portfolio_items WHERE status='published', falls back to data.ts portfolioItems
```

**`src/hooks/useCaseStudies.ts`**
```ts
export function useCaseStudies() — reads case_studies WHERE status='published', falls back to data.ts caseStudies
```

**`src/hooks/useTeamMembers.ts`**
```ts
export function useTeamMembers() — reads team_members WHERE status='active' ORDER BY sort_order, falls back to data.ts teamMembers
```

### Step 4 – Update Frontend Pages (remove hardcoded data imports)

| File | Remove | Add |
|------|--------|-----|
| `src/pages/Blog.tsx` | `import { blogPosts }` | `useBlogPosts()` |
| `src/pages/Team.tsx` | `import { teamMembers }` | `useTeamMembers()` |
| `src/pages/Portfolio.tsx` | `import { portfolioItems }` | `usePortfolioItems()` |
| `src/pages/CaseStudies.tsx` | `import { caseStudies }` | `useCaseStudies()` |
| `src/pages/About.tsx` | hardcoded `values[]`, `timeline[]`, `teamMembers` | `usePageSection('/about','values')`, `usePageSection('/about','timeline')`, `useTeamMembers()` |

### Step 5 – Fix NavigationAdmin Form
Add two new fields to the form:
- **nav_area**: `<select>` with options "header" | "footer"
- **footer_column**: `<select>` (only visible when nav_area = "footer") with "services" | "company" | "resources"

Update list view to show which area each item belongs to.

### Step 6 – Fix HeroSlidesAdmin
Add `page_path` field to the form (dropdown: Home `/`, About `/about`, Portfolio `/portfolio`, etc.).
Update the slide row display to show which page it's assigned to.

---

## Files to Create
- `src/hooks/useBlogPosts.ts`
- `src/hooks/usePortfolioItems.ts`
- `src/hooks/useCaseStudies.ts`
- `src/hooks/useTeamMembers.ts`

## Files to Modify
- `src/pages/admin/BlogAdmin.tsx` – fix handleEdit fetch
- `src/pages/admin/PortfolioAdmin.tsx` – fix handleEdit fetch
- `src/pages/admin/CaseStudiesAdmin.tsx` – fix handleEdit fetch
- `src/pages/admin/TeamAdmin.tsx` – fix handleEdit fetch
- `src/pages/admin/HeroSlidesAdmin.tsx` – add page_path field
- `src/pages/admin/NavigationAdmin.tsx` – add nav_area + footer_column fields
- `src/pages/Blog.tsx` – replace hardcoded data with hook
- `src/pages/Team.tsx` – replace hardcoded data with hook
- `src/pages/Portfolio.tsx` – replace hardcoded data with hook
- `src/pages/CaseStudies.tsx` – replace hardcoded data with hook
- `src/pages/About.tsx` – replace hardcoded values/timeline/team with hooks

## Verification
1. Create blog post in admin → appears on /blog without page reload
2. Edit blog post → all fields (body, image, excerpt) pre-filled correctly
3. Edit team member → bio, linkedin, twitter pre-filled correctly
4. Edit portfolio → description pre-filled correctly
5. Edit case study → problem/solution/results pre-filled correctly
6. /team page shows DB data (admin-managed, not data.ts)
7. /portfolio page shows DB portfolio items
8. /blog page shows DB blog posts
9. Navigation items can be assigned to header or footer with correct column
10. Hero slides can be assigned to specific pages
