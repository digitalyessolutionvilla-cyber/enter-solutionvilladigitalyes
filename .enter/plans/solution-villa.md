# Full-Site CMS: Complete Content Management for All Frontend Pages

## Context
The frontend uses hardcoded content from `src/lib/data.ts` (services, stats, hero text, about copy, CTA, contact info, nav links, footer links). The goal is to move ALL content into the database and build a comprehensive admin UI so that every visible element on the public site can be edited from the CMS — no developer intervention needed.

The approach: **Premium Form-Based CMS Editor** with live preview iframe. Every frontend component becomes database-driven via lightweight React hooks. The admin gets a rich section-by-section editor with media picker, drag-to-reorder, and side-by-side live preview.

---

## Phase 1 — Database Migrations (1 migration file)

### New table: `services`
```sql
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Globe',
  title text NOT NULL,
  description text,
  tag text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  link_href text DEFAULT '/#services',
  created_at timestamptz DEFAULT now()
);
```
Seed all 10 services from `data.ts`.

### New table: `hero_slides`
```sql
CREATE TABLE hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text NOT NULL,
  cta_text text,
  cta_href text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true
);
```

### Expand `page_sections` seeds
Add/update JSON seeds for ALL sections across ALL pages:
- `/` → `hero`, `stats`, `cta`, `services_header`, `testimonials_header`, `portfolio_header`, `blog_header`
- `/about` → `hero`, `mission_vision`, `values`, `timeline`, `team_cta`, `page_cta`
- `/contact` → `hero`, `office_info`
- `/portfolio` → `hero`
- `/case-studies` → `hero`
- `/blog` → `hero`

---

## Phase 2 — Frontend Hooks (make all components DB-driven)

### New file: `src/hooks/usePageSection.ts`
```ts
// Fetches a page_section from DB, falls back to provided default
export function usePageSection<T>(pagePath: string, sectionKey: string, fallback: T): T
```
Uses `supabase.from('page_sections').select('content').eq('page_path', pagePath).eq('section_key', sectionKey).maybeSingle()` — returns `content` cast to T, or fallback if null.

### New file: `src/hooks/useServices.ts`
Fetches from `services` table ordered by `sort_order` where `is_active = true`. Falls back to `data.ts` services.

### New file: `src/hooks/useSiteSettings.ts`
Fetches all rows from `site_settings` and returns a `Record<string, string>` map. Used by Contact page and Footer.

### New file: `src/hooks/useNavigation.ts`
Fetches from `navigation_items` where `is_active = true` ordered by `sort_order`. Returns top-level items + children for submenus. Falls back to `data.ts` navLinks.

### Update these frontend components to be DB-driven:

| Component | Hook | Section Key |
|---|---|---|
| `HeroSection.tsx` | `usePageSection('/', 'hero')` | headline1, headline2, subheadline, cta_primary_text, cta_primary_href, cta_secondary_text, cta_secondary_href, keywords (JSON array) |
| `StatsSection.tsx` | `usePageSection('/', 'stats')` | JSON array of {value, suffix, label} |
| `CTASection.tsx` | `usePageSection('/', 'cta')` | title, highlighted_word, subtitle, badges (array), primary_cta_text, primary_cta_href, secondary_cta_text, secondary_cta_href |
| `ServicesSection.tsx` | `useServices()` | reads from services table |
| `Navbar.tsx` | `useNavigation()` | reads from navigation_items table |
| `Footer.tsx` | `useNavigation()` + `useSiteSettings()` | nav items + contact info |
| `About.tsx` | `usePageSection('/about', 'mission_vision')`, `usePageSection('/about', 'values')`, `usePageSection('/about', 'timeline')` | JSON arrays |
| `Contact.tsx` | `useSiteSettings()` | contact_email, contact_phone, contact_address, business_hours |

**Key principle:** Each hook returns data immediately from fallback, then silently replaces with DB data when loaded (no loading spinner on public site — instant render).

---

## Phase 3 — New Admin Pages

### 3a. `ServicesAdmin` — `/admin/services`
Full CRUD for the services table:
- Sortable list with drag handle (using `@dnd-kit/sortable`)
- Form fields: Icon picker (shows all lucide icons from allowed list), Title, Tag, Description, Link, Active toggle
- Save re-orders automatically updating `sort_order`

### 3b. Complete `ContentEditor` — `/admin/content` (replaces/extends current PageEditor)
The master editor with:
- **Top nav**: Page tabs — Home | About | Portfolio | Case Studies | Blog | Contact
- **Left panel** (60%): All sections for the selected page shown as expandable cards
  - Section cards have: Section name, last updated, expand/collapse, save button
  - Inside each card: all JSON fields rendered as smart form inputs
  - Image fields → show thumbnail + "Change Image" button (opens MediaPickerModal)
  - Array fields (stats, badges, timeline, values) → add/remove/reorder items
  - Button/link fields → text input + URL input side by side
  - Icon fields → icon picker dropdown
- **Right panel** (40%): Live preview iframe showing the actual public page, auto-refreshes on save
- Drag-to-reorder sections within a page
- Show/hide section toggle (stored in page_sections.content as `is_visible: true/false`)

### 3c. Enhanced `NavigationAdmin` — already at `/admin/navigation` 
Add a **Footer Links** tab alongside the existing Header tab:
- Same CRUD but with `nav_area: 'footer'` column distinguishing header vs footer items
- Footer grouped by column (Services, Company, Resources)

### 3d. `HeroSlidesAdmin` — `/admin/hero-slides`
- Upload hero background images for rotating carousel
- Set title, subtitle, CTA per slide
- Drag to reorder, toggle active

---

## Phase 4 — Update AdminLayout + Router

Add new nav items:
- "Services" → `/admin/services` (under Content section)
- "Content Editor" → `/admin/content` (replaces basic "Page Editor")
- "Hero Slides" → `/admin/hero-slides` (under Content section)

Add routes to `router.tsx`:
- `/admin/services` → ServicesAdmin
- `/admin/content` → ContentEditor  
- `/admin/hero-slides` → HeroSlidesAdmin

---

## Phase 5 — Install Dependencies
- `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` — drag and drop for section reorder + service sort

---

## Files to Create
```
src/hooks/usePageSection.ts
src/hooks/useServices.ts
src/hooks/useSiteSettings.ts
src/hooks/useNavigation.ts
src/pages/admin/ServicesAdmin.tsx
src/pages/admin/ContentEditor.tsx     (replaces/extends PageEditor)
src/pages/admin/HeroSlidesAdmin.tsx
src/components/admin/MediaPickerModal.tsx
src/components/admin/IconPicker.tsx
src/components/admin/SortableSection.tsx
```

## Files to Modify
```
src/components/home/HeroSection.tsx     → use usePageSection hook
src/components/home/StatsSection.tsx    → use usePageSection hook
src/components/home/CTASection.tsx      → use usePageSection hook
src/components/home/ServicesSection.tsx → use useServices hook
src/components/layout/Navbar.tsx        → use useNavigation hook
src/components/layout/Footer.tsx        → use useNavigation + useSiteSettings hooks
src/pages/About.tsx                     → use usePageSection hooks for all sections
src/pages/Contact.tsx                   → use useSiteSettings hook for office info
src/components/admin/AdminLayout.tsx    → add new nav items
src/router.tsx                          → add new routes
```

## Files to Keep (no change needed)
```
src/pages/Blog.tsx        (already DB-driven via blog_posts table)
src/pages/Portfolio.tsx   (already DB-driven via portfolio_items table)
src/pages/CaseStudies.tsx (already DB-driven via case_studies table)
src/pages/Team.tsx        (already DB-driven via team_members table)
```

## Verification
1. Log into admin → Content Editor → Home page → change Hero headline → Save → visit public homepage → headline changed instantly
2. Admin → Services → reorder a service → public site shows new order
3. Admin → Navigation → change a menu item label → public navbar shows new label
4. Admin → Settings → change contact email → Contact page shows new email
5. Admin → Media Library → upload an image → use in Content Editor as hero background
6. Admin → Hero Slides → add a slide → public site hero rotates through slides
