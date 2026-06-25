# Newsletter Management — Plan

## Context
The footer has a subscribe form that only sets local state (never saves to DB). The user wants:
1. All subscriber emails saved to a Supabase table
2. An admin page to view/manage subscribers
3. Ability to compose and send email campaigns to all subscribers via Resend

---

## Implementation Steps

### 1. DB Migration
Create two tables:

**`newsletter_subscribers`**
- id (uuid PK)
- email (text, unique, not null)
- name (text, nullable)
- status (`active` | `unsubscribed`, default `active`)
- source (text, default `footer`) — where they signed up
- created_at (timestamptz)
- RLS: public can insert (subscribe), authenticated can read/update/delete

**`newsletter_campaigns`**
- id (uuid PK)
- subject (text, not null)
- body (text, not null) — plain HTML or markdown
- status (`draft` | `sent`, default `draft`)
- sent_at (timestamptz)
- recipient_count (int, default 0)
- created_at (timestamptz)
- RLS: authenticated only

---

### 2. Fix Footer Subscribe Form
**File:** `src/components/layout/Footer.tsx`
- `handleSubscribe()` → call `supabase.from("newsletter_subscribers").insert({ email, source: "footer" })` with upsert on conflict (email) to avoid duplicate errors
- Show success or "already subscribed" message

---

### 3. Supabase Edge Function — send-newsletter-campaign
**File:** `supabase/functions/send-newsletter-campaign/index.ts`
- Accepts `{ campaignId }` in POST body
- Fetches campaign by id from `newsletter_campaigns`
- Fetches all `active` subscribers from `newsletter_subscribers`
- Sends individual emails via Resend API (`https://api.resend.com/emails`) using `RESEND_API_KEY` secret
- Updates campaign `status = 'sent'`, `sent_at = now()`, `recipient_count = N`
- Returns `{ sent: N }`

Secret needed: `RESEND_API_KEY` — will prompt user with `supabase_add_secret`

---

### 4. Admin Page — Newsletter
**File:** `src/pages/admin/NewsletterAdmin.tsx`

Two tabs: **Subscribers** | **Campaigns**

**Subscribers tab:**
- Stats bar: Total, Active, Unsubscribed
- Table: Email | Source | Date subscribed | Status | Actions (unsubscribe / delete)
- Export CSV button (generates `data:text/csv` download)
- Search/filter input

**Campaigns tab:**
- List of past campaigns with status badge, date, recipient count
- "New Campaign" button → opens compose panel:
  - Subject input
  - Body textarea (HTML or plain text)
  - "Save as Draft" and "Send Now" buttons
- "Send Now" invokes edge function → shows sending spinner → success toast

---

### 5. Router + Sidebar
**File:** `src/router.tsx` — add `/admin/newsletter` route
**File:** `src/components/admin/AdminLayout.tsx` — add nav item under Content section
- Icon: `Mail` from lucide-react (already imported group)
- Label: "Newsletter"
- href: `/admin/newsletter`

---

## Files Modified
| File | Change |
|---|---|
| `supabase/migrations/migration_*` | Create 2 tables |
| `src/components/layout/Footer.tsx` | Save subscribe to DB |
| `supabase/functions/send-newsletter-campaign/index.ts` | New edge function |
| `src/pages/admin/NewsletterAdmin.tsx` | New admin page |
| `src/router.tsx` | Add route |
| `src/components/admin/AdminLayout.tsx` | Add nav item |

## Secrets Required
- `RESEND_API_KEY` — Resend dashboard → API Keys → Create Key

## Verification
1. Subscribe via footer → check Subscribers tab shows the email
2. Create a draft campaign → save → appears in list
3. Send campaign → spinner → success toast → recipient count updates
4. Unsubscribe a user → status changes, not included in future sends
