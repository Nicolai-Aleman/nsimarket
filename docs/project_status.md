# Project Status — No Somos Ignorantes (MVP Tracker)

## 0) Summary
Goal: Launch a landing + marketplace with bank QR payments (proof upload + admin approval) and secure delivery for Excel products.

**Primary goals:**
- Subscribe + Buy
- 10.000 Bs/month target
- Organic growth + B2B leads

**Key constraints:**
- Bank transfer QR has no webhook
- MVP uses manual approval
- Download links expire in 48h
- QR asset path: `/assets/QR.jpg`

---

## 1) Current state (as of today)
### Completed
- Product vision + goals defined
- MVP flow defined (QR + proof upload + admin approval)
- Architecture folder plan created
- SQL files 01–04 executed successfully in Supabase (per your notes)

### Blockers / Risks
- Supabase SQL file 05 error previously encountered:
  - `function public.record_download() does not exist`
- Need to confirm:
  - Admin notification channel for MVP (Email vs Telegram)
  - Login method (magic link vs password)
  - Pack strategy (2 packs recommended)

---

## 2) Decisions (pending)
1) Packs for MVP:
- Proposed: 2 packs (Personal Starter + Emprendedor Starter)
- Pending: confirm acceptance

2) Login method:
- Proposed: magic link (reduce friction/support)
- Pending: confirm

3) Admin notifications (free):
- Proposed: Email or Telegram bot
- Pending: choose one for MVP

---

## 3) Milestones
### Milestone A — Repo structure + docs (Phase 0)
- [ ] Create `/docs`, `/prompts`, `/agents`
- [ ] Add `Claude.md` project memory
- [ ] Move legacy docs:
  - `GUIA-PUBLICACION.md` → `docs/publishing.md`
  - `GOOGLE-APPS-SCRIPT.md` → `docs/google_apps_script.md`
- [ ] Inventory product files:
  - Map `excel_products/*` → `products.slug`, `price_bob`, `category`

### Milestone B — Frontend MVP (Phase 1)
- [ ] Landing sections:
  - Hero + Subscribe CTA + Marketplace CTA
  - Top products (anchors)
  - Free lead magnet
  - How it works
  - FAQ
- [ ] Marketplace grid
- [ ] Checkout page:
  - QR component integrated with design
  - Proof upload UI

### Milestone C — Supabase integration (Phase 2)
- [ ] Create tables (products/orders/proofs/downloads/email_logs)
- [ ] Storage buckets (products/proofs)
- [ ] RLS policies
- [ ] Auth flow (magic link)
- [ ] “Mis compras” page
- [ ] Admin review page (restricted)

### Milestone D — Fulfillment + Email (Phase 3)
- [ ] Signed download URLs (48h expiry)
- [ ] Email templates in Spanish:
  - Proof received
  - Approved + download link
  - Rejected
- [ ] Logging in `email_logs`

### Milestone E — Growth (Phase 4)
- [ ] Packs + coupon codes
- [ ] SEO expansions
- [ ] B2B lead funnel
- [ ] WhatsApp automation (Phase 2 due to costs)

---

## 4) Immediate next actions (next 60–90 minutes)
1) Confirm pending decisions:
- Packs: YES/NO
- Login: magic link or password
- Admin notification: Email or Telegram

2) Create and paste these docs:
- `docs/brainstorm.md`
- `docs/project_spec.md`
- `docs/architecture.md`
- `docs/project_status.md`

3) Prepare `Claude.md` with:
- goals
- folder structure
- rules (English docs, Spanish customer copy)
- QR path lock
- link expiry

---

## 5) Notes on token efficiency (AI workflow)
- Use role-based agents:
  - `landing_builder` (UI + copy)
  - `excel_builder` (one product per run)
  - `supabase_fixer` (SQL/RLS/storage)
  - `qa_checklist` (test plan)
- Keep each agent scoped; do not mix backend + Excel in the same run unless necessary.

---

## 6) Next document to create
- `docs/changelog.md` (versioned changes)
