# Solution Villa – "The Digital YES" — Full Website Build Plan

## Context
Build a world-class, enterprise-level website for Solution Villa, an African digital agency.
Stack: React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
Backend: Enter Cloud (Supabase) for database, auth, edge functions.
Design: Dark-first futuristic glassmorphism with Deep Blue (#0A2540), Electric Blue (#0066FF), Neon Cyan (#00E5FF).

---

## Phase 0 — Enable Enter Cloud + Install Dependencies
- Enable Enter Cloud (Supabase) via `supabase_enable`
- Install extra packages: `framer-motion`, `embla-carousel-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `yet-another-react-lightbox`, `react-intersection-observer`, `react-countup`, `canvas-confetti`
- Add Google Fonts (Inter) to `index.html`

---

## Phase 1 — Design System (index.css + tailwind.config.ts)
Update both files with all brand tokens:

### CSS Custom Properties (`index.css`)
```
:root {
  /* Brand Primitives */
  --color-deep-blue: 216 80% 15%;        /* #0A2540 */
  --color-electric-blue: 220 100% 50%;   /* #0066FF */
  --color-neon-cyan: 191 100% 50%;       /* #00E5FF */
  --color-surface-dark: 220 60% 5%;      /* #060F1E */
  --color-surface-mid: 216 80% 15%;      /* #0A2540 */
  --color-surface-raised: 213 70% 18%;   /* #0D2D4E */

  /* Semantic Tokens (override shadcn defaults) */
  --background: var(--color-surface-dark);
  --foreground: 0 0% 100%;
  --primary: var(--color-electric-blue);
  --primary-foreground: 0 0% 100%;
  --secondary: var(--color-surface-mid);
  --secondary-foreground: 0 0% 100%;
  --accent: var(--color-neon-cyan);
  --accent-foreground: 220 60% 5%;
  --muted: 213 40% 20%;
  --muted-foreground: 215 20% 60%;
  --card: 216 80% 15%;        /* glass base */
  --border: 220 40% 20%;
  --input: 220 40% 18%;
  --ring: var(--color-neon-cyan);
  --radius: 0.75rem;

  /* Glass */
  --glass-bg: rgba(10,37,64,0.55);
  --glass-border: rgba(0,102,255,0.25);
  --glass-blur: blur(20px) saturate(180%);
  --glass-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,229,255,0.06);

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #060F1E 0%, #0A2540 45%, #001A4D 100%);
  --gradient-brand: linear-gradient(90deg, #0066FF 0%, #00E5FF 100%);
  --gradient-glow: radial-gradient(ellipse at center, rgba(0,102,255,0.35) 0%, transparent 70%);
  --gradient-card: linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(0,229,255,0.05) 100%);
  --gradient-text: linear-gradient(90deg, #0066FF, #00E5FF);

  /* Animations */
  --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
  --ease-standard: cubic-bezier(0.4,0,0.2,1);
}
```

### tailwind.config.ts additions
- Custom colors: `electric-blue`, `deep-blue`, `neon-cyan`, `surface-dark`, `surface-mid`, `surface-raised`
- Custom animations: `float`, `pulse-glow`, `gradient-shift`, `bounce-soft`, `fade-up`
- Custom keyframes for all animations above
- Extended `boxShadow` with `glow`, `glass`, `card` variants
- Extended `backdropBlur` with `glass` variant

---

## Phase 2 — Layout Components
### Files to create:
- `src/components/layout/Navbar.tsx` — sticky transparent→solid, mobile drawer, "Get a Quote" CTA
- `src/components/layout/Footer.tsx` — 4-column grid, newsletter input, social icons
- `src/components/layout/PageLayout.tsx` — wraps pages with Navbar + Footer

### Navbar behavior:
- `useScrollPosition` hook → adds `scrolled` class at 80px
- Mobile: Sheet drawer (right-side), hamburger icon (Menu/X toggle)
- Links: Home, About, Services, Portfolio, Case Studies, Blog, Contact
- CTA button: gradient pill "Get a Quote" → scrolls to contact form

---

## Phase 3 — Home Page (`src/pages/Index.tsx`)
Compose from section components (each in `src/components/home/`):

### `HeroSection.tsx`
- Full-screen (100vh), `--gradient-hero` background
- Animated mesh orbs (CSS keyframes, 3 radial-gradient layers)
- Particle canvas (60 floating tech-icon nodes via `canvas` + `requestAnimationFrame`)
- Eyebrow tag: "The Digital YES" (neon-cyan pill)
- Animated headline with word-swap (rotating keywords via `useState` + interval)
- Sub-headline + dual CTA buttons
- Stats bar: 4 counters (200+ Projects, 150+ Clients, 50+ Team, 8+ Years) using `react-countup`
- Animated scroll indicator (ChevronDown bouncing)
- Entrance: Framer Motion `staggerChildren`, each element `fade-up` with delay

### `ServicesSection.tsx`
- Section title + subtitle
- 10 `ServiceCard` components in responsive grid (4→2→1 cols)
- Each card: glassmorphism, lucide icon, title, description, "Learn More" link
- Hover: `translateY(-4px)`, border brightens to neon-cyan, corner glow appears
- Scroll-triggered stagger entrance via `react-intersection-observer`
- Services list: Branding & Design, Digital Marketing, Event Production, Media & Content, Website Development, Printing Solutions, Business Consulting, Mobile Apps, Software Solutions, Cloud Solutions

### `StatsSection.tsx`
- Dark gradient band
- 4 counter items with `react-countup` triggered by viewport entry
- Gradient text on values, muted label

### `PortfolioPreview.tsx`
- Section heading
- 6-item masonry grid (3→2→1 cols) with placeholder images
- Category filter tabs (All, Branding, Web, Apps, Events, Media)
- Hover overlay with project title + category badge + lightbox icon
- "View All Work" CTA button

### `TestimonialsSection.tsx`
- Embla Carousel with 5 testimonial cards
- Each: quote icon, text, avatar, name/title/company
- Dot indicators, prev/next arrows
- Auto-play every 6s, pause on hover

### `BlogPreview.tsx`
- 3 blog cards in responsive grid
- Each: thumbnail, category badge, title, excerpt, author row
- "Read All Articles" CTA

### `CTASection.tsx`
- Full-width gradient band: "Ready to Transform Your Business?"
- Primary CTA: "Let's Build Something Amazing"

---

## Phase 4 — Other Public Pages

### `src/pages/About.tsx`
- Hero banner with page title
- Mission / Vision / Core Values (3 glassmorphism cards)
- Company story timeline (alternating left/right on desktop, stacked mobile)
- Team preview grid (4 cards) + "Meet The Full Team" button
- CTA banner → Contact

### `src/pages/Team.tsx`
- Page hero
- Department filter tabs
- Team member cards grid (4→2→1 cols)
- Each card: photo (avatar placeholder), name, position, bio, social icons (LinkedIn, Twitter)
- Hover: subtle flip or slide-up bio reveal

### `src/pages/Portfolio.tsx`
- Page hero
- Filter tabs (All, Branding, Websites, Mobile Apps, Events, Media, Printing, Marketing)
- Masonry grid (CSS columns, 3→2→1)
- Lightbox via `yet-another-react-lightbox`
- Each item: image, overlay with title + category + open icon

### `src/pages/CaseStudies.tsx`
- Page hero + search bar
- Category + industry filter
- Featured case study (wide card) + grid of case study cards
- Each card: cover image, client name, industry tag, brief description

### `src/pages/CaseStudyDetail.tsx` (`:id` route)
- Cover image hero
- Client info bar (name, industry, date)
- Challenge / Solution / Results sections (3-column on desktop)
- Results stats (3 animated counters)
- Gallery grid
- Video embed (YouTube iframe)
- Client testimonial quote block
- Related case studies

### `src/pages/Blog.tsx`
- Featured post (large hero card) at top
- Search bar + category filter tabs
- Blog card grid (3→2→1 cols)
- Pagination

### `src/pages/BlogPost.tsx` (`:slug` route)
- Reading progress bar (top of viewport)
- Post header: title, author, date, category, read time
- Rich text body (styled prose)
- Related posts (3 cards)

### `src/pages/Contact.tsx`
- Page hero
- 2-column layout: Contact Form (left) + Office Info Panel (right)
- Form: Name, Email, Phone, Subject (select), Message, Submit
- Office panel: address, phone, email, hours, social icons, map embed
- Form submission → Enter Cloud (Supabase) `contact_submissions` table + toast notification

---

## Phase 5 — Enter Cloud (Supabase) Setup

### Database Tables
```sql
-- contact_submissions
id uuid PK, name text, email text, phone text, subject text, message text, created_at timestamptz, status text DEFAULT 'new'

-- blog_posts
id uuid PK, title text, slug text UNIQUE, excerpt text, body text, category text, tags text[], author_id uuid, featured_image text, status text DEFAULT 'draft', published_at timestamptz, created_at timestamptz, updated_at timestamptz, views int DEFAULT 0

-- portfolio_items
id uuid PK, title text, category text, description text, image_url text, client text, year int, tags text[], sort_order int, status text DEFAULT 'published'

-- case_studies
id uuid PK, title text, slug text UNIQUE, client text, industry text, cover_image text, problem text, solution text, results text, gallery text[], video_url text, testimonial text, testimonial_author text, status text DEFAULT 'published', created_at timestamptz

-- team_members
id uuid PK, name text, position text, department text, bio text, photo_url text, linkedin text, twitter text, sort_order int, status text DEFAULT 'active'

-- testimonials
id uuid PK, quote text, author_name text, author_title text, company text, avatar_url text, status text DEFAULT 'published', sort_order int

-- users_profiles (extends Supabase auth.users)
id uuid PK (references auth.users), full_name text, role text CHECK (role IN ('super_admin','admin')), avatar_url text, created_at timestamptz
```

### Row Level Security
- `contact_submissions`: Insert for anon, Select/Update for authenticated admins
- `blog_posts`/`portfolio_items`/etc.: Select published for anon, full CRUD for authenticated
- `users_profiles`: Admins see all; users see own

### Auth
- Supabase email/password auth
- `users_profiles.role` checked on login → stored in React context

---

## Phase 6 — Admin Panel

### Routes (all under `/admin`)
- `/admin` → redirect to `/admin/dashboard`
- `/admin/login` — login page (protected, redirects if already authed)
- `/admin/dashboard` — stats overview
- `/admin/blog` — list + CRUD
- `/admin/blog/new` — new post editor
- `/admin/blog/:id/edit` — edit post
- `/admin/portfolio` — list + CRUD
- `/admin/portfolio/new` / `edit`
- `/admin/case-studies` — list + CRUD
- `/admin/team` — list + CRUD
- `/admin/testimonials` — list + CRUD
- `/admin/inquiries` — contact submissions list (read + status update)
- `/admin/users` — Super Admin only: manage users + roles
- `/admin/settings` — site info, SEO defaults

### Layout
- `src/components/admin/AdminLayout.tsx` — fixed sidebar (240px) + topbar
- `src/components/admin/Sidebar.tsx` — nav items with RBAC visibility
- `src/components/admin/Topbar.tsx` — page title, notifications, user dropdown

### Key Components
- `src/components/admin/StatsCard.tsx` — dashboard stat tiles
- `src/components/admin/DataTable.tsx` — reusable table with actions
- `src/components/admin/ContentEditor.tsx` — rich text editor (textarea for now, upgrade to Tiptap later)
- `src/components/admin/ImageUpload.tsx` — URL-based image input (no binary upload needed initially)
- `src/components/admin/StatusBadge.tsx` — published/draft/archived pills

### Auth Guard
- `src/components/admin/ProtectedRoute.tsx` — checks Supabase session, redirects to login if none
- `src/context/AuthContext.tsx` — provides user, role, signIn, signOut

### RBAC Rules
- Super Admin: all nav items + delete buttons + Users page
- Admin: no Users & Roles nav item, no delete on content (hide button, not just style)

---

## Phase 7 — Shared Utility Components
- `src/components/ui/GlassCard.tsx` — reusable glassmorphism card wrapper
- `src/components/ui/SectionHeader.tsx` — eyebrow + title + subtitle pattern
- `src/components/ui/AnimatedCounter.tsx` — countup with IntersectionObserver
- `src/components/ui/ParticleCanvas.tsx` — hero particle system
- `src/components/ui/GradientText.tsx` — gradient clip-path text
- `src/components/ui/ScrollReveal.tsx` — IntersectionObserver fade-up wrapper
- `src/hooks/useScrollPosition.ts` — scroll Y tracker for Navbar
- `src/lib/supabase.ts` — Supabase client

---

## Files to Modify
- `src/index.css` — full design token rewrite
- `tailwind.config.ts` — brand color extensions + custom animations
- `src/router.tsx` — add all public + admin routes
- `src/App.tsx` — wrap with AuthContext + global QueryClient
- `src/pages/Index.tsx` — compose Home page from section components
- `index.html` — add Google Fonts (Inter)

---

## Files to Create (organized)
```
src/
  context/AuthContext.tsx
  hooks/useScrollPosition.ts
  lib/supabase.ts
  lib/data.ts                     ← static seed data (services, testimonials, etc.)
  components/
    layout/
      Navbar.tsx
      Footer.tsx
      PageLayout.tsx
    home/
      HeroSection.tsx
      ServicesSection.tsx
      StatsSection.tsx
      PortfolioPreview.tsx
      TestimonialsSection.tsx
      BlogPreview.tsx
      CTASection.tsx
    admin/
      AdminLayout.tsx
      Sidebar.tsx
      Topbar.tsx
      ProtectedRoute.tsx
      StatsCard.tsx
      DataTable.tsx
      StatusBadge.tsx
    ui/
      GlassCard.tsx
      SectionHeader.tsx
      AnimatedCounter.tsx
      ParticleCanvas.tsx
      GradientText.tsx
      ScrollReveal.tsx
  pages/
    About.tsx
    Team.tsx
    Portfolio.tsx
    CaseStudies.tsx
    CaseStudyDetail.tsx
    Blog.tsx
    BlogPost.tsx
    Contact.tsx
    admin/
      Login.tsx
      Dashboard.tsx
      BlogAdmin.tsx
      PortfolioAdmin.tsx
      CaseStudiesAdmin.tsx
      TeamAdmin.tsx
      TestimonialsAdmin.tsx
      Inquiries.tsx
      Users.tsx
      Settings.tsx
```

---

## Verification
1. Home page hero renders with animated gradient + particle canvas + counters
2. Service cards show glassmorphism with hover effects
3. Portfolio filter tabs switch categories with animation
4. Testimonials carousel auto-plays
5. Contact form submits to Supabase and shows toast
6. Admin login page authenticates via Supabase auth
7. Admin dashboard shows stats from DB
8. Admin CRUD works for blog/portfolio/team
9. Super Admin sees Users page; Admin does not
10. All pages are responsive (mobile, tablet, desktop)
11. Navbar transitions from transparent to solid on scroll
12. All animations respect `prefers-reduced-motion`
