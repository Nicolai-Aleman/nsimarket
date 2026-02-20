# Project Spec — No Somos Ignorantes (Landing + Marketplace)

## 1) Overview
We are building a static landing + marketplace for the brand **“No Somos Ignorantes”** to:
- Drive YouTube subscriptions
- Sell Excel digital products
- Deliver purchased files securely through a “Mis compras” account area
- Support bank transfer QR payments (no webhook) with proof upload + admin approval

**QR asset path (single source of truth):**
- `/assets/QR.jpg` (do not rename, do not duplicate)

**Link expiry requirement:**
- Download links must expire after **48 hours**

---

## 2) Goals and non-goals

### Goals (MVP)
- Marketplace listing of products (Spanish names)
- Product detail pages (optional for MVP, recommended)
- Checkout flow with QR payment instructions
- Proof-of-payment upload stored in Supabase Storage
- Admin review flow (approve/deny)
- Customer account: “Mis compras” login + downloads
- Email notification to customer when approved (Spanish)
- Free lead magnet download capture

### Non-goals (MVP)
- Fully automatic payment confirmation (no bank webhook)
- Full WhatsApp automation for customers (Phase 2)
- Subscription billing (Phase 2)
- Complex analytics dashboard (Phase 2)

---

## 3) Success metrics
- Revenue: **10.000 Bs/month**
- Organic traffic growth via SEO pages
- Lead magnet conversion rate
- B2B lead capture rate

---

## 4) Current repo structure (target)
We keep your static stack and add AI memory + prompt library.