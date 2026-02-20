# Architecture — No Somos Ignorantes (Landing + Marketplace)

## 1) System overview
This project is a landing + marketplace to sell Excel digital products for **“No Somos Ignorantes”** using:
- Static frontend (HTML/CSS/JS for MVP)
- Supabase for auth, database, storage, security (RLS)
- Bank transfer QR payments (no webhook)
- Semi-automatic approval (proof upload + admin review)
- Secure delivery via signed download links (48h expiry)
- Customer account area: **“Mis compras”**

**Single source of truth for QR image:**
- `/assets/QR.jpg` (must not be renamed or duplicated)

---

## 2) High-level data flows

### 2.1 Visitor → Subscriber
Flow goal: maximize YouTube subscriptions.
- Landing CTA drives to YouTube subscribe action
- Optional: capture email via lead magnet (**Presupuesto 50/30/20**)

### 2.2 Visitor → Buyer (Bank QR, no webhook)
Flow goal: turn traffic into purchases.

1) User selects product  
2) User enters email and logs in (magic link recommended)  
3) Order created in DB → `status = pending_payment`  
4) Checkout displays QR integrated as UI component  
5) User uploads proof image → `status = payment_review`  
6) Admin reviews proof, approves manually  
7) On approval: system creates signed download token + expiry 48h  
8) Email sent in Spanish + “Mis compras” shows download button  
9) User downloads → download logged

### 2.3 Buyer → Repeat buyer
- Packs and coupons increase AOV
- Email sequence in Spanish drives upsells
- SEO pages drive organic repeat traffic

---

## 3) Components and responsibilities

### 3.1 Frontend (Static MVP)
Responsibilities:
- Landing page content + CTAs
- Marketplace product cards
- Checkout page with QR component and proof upload
- Login and “Mis compras” pages (client-side + Supabase auth)
- Admin review page (restricted)

Key UI requirement:
- QR must be a designed component, not a raw image dropped in layout.
- Use card layout, hierarchy, instructions, and strong CTA.

### 3.2 Supabase (Backend)
Responsibilities:
- Auth (magic link)
- Database tables and relationships
- Row Level Security (RLS) enforcement
- Storage for:
  - `products` bucket (Excel files)
  - `proofs` bucket (payment proof images)
- Signed URL generation (48h expiry)
- Optional edge functions (email sending, download token issuance)

### 3.3 Email delivery (Spanish)
Responsibilities:
- Notify customer in Spanish:
  - Proof received
  - Approved + download link
  - Rejected + next steps
- Log emails in `email_logs`

### 3.4 Admin workflow (MVP)
Responsibilities:
- Receive notification (free channel: Email or Telegram)
- Review proofs
- Approve/deny orders
- Trigger fulfillment

---

## 4) Database and storage layout (reference)

### 4.1 Tables (core)
- `products`
- `orders`
- `payment_proofs`
- `downloads`
- `email_logs`

### 4.2 Storage buckets
- `products` (private)
  - `products/personal/...`
  - `products/emprendedor/...`
  - `products/premium/...`
  - `products/packs/...`
- `proofs` (private)
  - `proofs/{order_id}/{timestamp}.jpg`

---

## 5) Security model (RLS and access)
### 5.1 Principles
- Default deny.
- Users only access their own data.
- Admin-only areas require an admin claim/role.

### 5.2 User permissions
Users can:
- Read their own `orders`
- Insert and read their own `payment_proofs` (only for their orders)
- Read their own `downloads`
- Request a signed download URL only if:
  - order is approved/paid
  - token is valid and not expired

Users cannot:
- List all products files in storage (no public access)
- Access proofs from other users
- Modify fulfilled orders

### 5.3 Signed links
- 48h expiry
- Log each download attempt
- Optional: one-time token model

---

## 6) “QR as a component” design requirement
### 6.1 What “not allowed” means
- Not allowed: raw `<img src="/assets/QR.jpg">` with no design context.
- Allowed: QR inside a “Payment Card” component with:
  - Title
  - Instruction list
  - Amount reference
  - Upload proof section
  - Support contact note
  - CTA prominence

### 6.2 Payment Card structure (UI)
- Left: steps (1–3) with short Spanish instructions
- Right: QR block (fixed size) + “Escanea para pagar”
- Below: proof upload + “Sube tu comprobante” button

---

## 7) Roadmap (phases)
### Phase 0 — Docs + inventory
- Confirm product list and prices
- Map `/excel_products` files to `products.slug`

### Phase 1 — UI (static)
- Landing + marketplace grid
- Checkout with QR component
- Lead magnet capture

### Phase 2 — Supabase integration
- Auth (magic link)
- DB tables + RLS
- Storage buckets
- Proof upload and admin review

### Phase 3 — Fulfillment and email
- Signed URLs and token expiry
- Spanish emails + logging
- “Mis compras” fully functional

### Phase 4 — Growth
- Packs + coupon codes
- SEO pages
- B2B lead forms
- WhatsApp automation (Phase 2 due to costs)

---

## 8) Implementation constraints
- Keep MVP minimal and reliable
- Bank QR means no webhook: must support manual approval
- All AI instructions and planning docs remain in English, except:
  - product names
  - customer-facing messages (email/WhatsApp/UI microcopy)
