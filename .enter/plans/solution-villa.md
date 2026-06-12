# SOLUTION AI Assistant — Full Build Plan

## Context
Build an AI-powered chat assistant named "SOLUTION" that appears as a floating widget on every page of the website. It acts as AI customer care, lead generator, and live chat platform. Admins can monitor and take over conversations in real time.

---

## Step 1 — Enable AI Capability
- Call `enable_ai_capability` tool to provision AI token

---

## Step 2 — Database Migration
Create 3 new tables:

### `chat_conversations`
- id, session_id (uuid), visitor_name, visitor_email, visitor_phone, company, status (active|waiting|taken|closed), assigned_to (uuid), created_at, updated_at

### `chat_messages`
- id, conversation_id (fk), role (user|assistant|admin), content, created_at

### `chat_leads`
- id, conversation_id (fk), name, email, phone, company, project_type, budget, timeline, created_at

RLS: Admins can read/manage all. Public can INSERT messages and read own conversation by session_id.
Enable realtime on all 3 tables.

---

## Step 3 — Edge Function: `solution-ai-chat`
**File:** `supabase/functions/solution-ai-chat/index.ts`

Flow:
1. Accept `{ message, conversation_id, session_id }` from frontend
2. Load last 10 messages from DB for context
3. Build system prompt with full Solution Villa company knowledge (hardcoded context)
4. Call AI (Claude or GPT-4o via AI token) with system prompt + conversation history
5. Detect lead collection intent → save partial lead data
6. Detect handover triggers ("human", "agent", "speak to someone") → flag conversation as `waiting`
7. Save AI reply to `chat_messages`
8. Return `{ reply, action? }` (action: "handover" | null)

System prompt includes:
- Company name, mission, vision, values
- All services (13 listed)
- Office contact info
- Website pages
- Greeting format
- "Never break character" instruction

---

## Step 4 — Frontend Chat Widget
**File:** `src/components/chat/SolutionWidget.tsx`

### Avatar Design (Premium Animated CSS)
- Fixed bottom-right bubble: circular avatar with gold ring
- Avatar is a stylized professional face SVG in gold/black theme
- States: idle (subtle breathing), thinking (pulse), typing (dots), greeting (wave)
- Animated using CSS keyframes defined in index.css

### Chat Panel
- Slide-up panel (400px wide, 560px tall) attached to avatar bubble
- Header: "SOLUTION" name + "Digital Assistant · Solution Villa" + green online dot
- Message bubbles: user = gold right-aligned, AI = dark left-aligned with avatar icon
- Typing indicator: 3 animated dots while AI is thinking
- Input field + send button
- Quick action chips on first open: "Our Services", "Get a Quote", "Talk to Human"

### Lead Capture Flow
When AI detects name/email/phone not yet collected, it asks naturally:
"Can I get your name so I can assist you better?"
Frontend stores collected fields in local state + saves to `chat_leads` table.

### State Management
- `sessionId`: stored in `localStorage` (persists across page refreshes)
- `conversationId`: created on first message, stored in localStorage
- `messages`: array of `{ role, content, timestamp }`
- `status`: idle | open | thinking | handover

### Greeting
On first open, show greeting message automatically:
"Hello 👋 I am Solution, your digital assistant at Solution Villa.
I'm here to help you explore our services, answer your questions, discuss your project ideas. Can I meet you?"

---

## Step 5 — Admin Live Chat Page
**File:** `src/pages/admin/LiveChat.tsx`

### Layout
- Left panel: conversation list with status badges (Active, Waiting, Closed)
- Right panel: selected conversation thread with real-time messages
- Top stats bar: Active, Waiting, Closed counts

### Features
- Real-time subscription to `chat_conversations` + `chat_messages` via Supabase realtime
- Admin can type and send reply (inserts message with role = "admin")
- "Take Over" button: sets conversation status to "taken", disables AI for that conversation
- "Close" button: sets status to "closed"
- Lead info panel: shows captured name/email/phone/company for selected conversation
- Conversation list auto-refreshes with new message counts

---

## Step 6 — Admin Layout Integration
**File:** `src/components/admin/AdminLayout.tsx`

- Add "Live Chat" menu item under a new "Communication" section with a notification dot showing unread/waiting count

**File:** `src/router.tsx`
- Add `/admin/live-chat` route

---

## Step 7 — Mount Widget on All Pages
**File:** `src/App.tsx` or `src/main.tsx`

- Import `SolutionWidget` and render it outside the router (so it persists across page navigations)

---

## Files to Create
- `src/components/chat/SolutionWidget.tsx` (main widget)
- `src/components/chat/SolutionAvatar.tsx` (avatar SVG + animations)
- `src/pages/admin/LiveChat.tsx`
- `supabase/functions/solution-ai-chat/index.ts`

## Files to Modify
- `src/App.tsx` — mount `<SolutionWidget />`
- `src/components/admin/AdminLayout.tsx` — add Live Chat nav
- `src/router.tsx` — add live chat route
- `src/index.css` — add avatar animation keyframes

---

## Verification
1. Chat bubble visible on every page (bottom-right)
2. Clicking opens panel with greeting message
3. Typing a question returns AI response within ~2s
4. Admin → Live Chat page shows conversations in real time
5. Admin can send a reply that appears in the visitor's chat
6. "Take Over" disables AI and routes messages to admin
