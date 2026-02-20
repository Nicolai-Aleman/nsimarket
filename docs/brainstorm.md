# Brainstorm — No Somos Ignorantes (Landing + Marketplace)

## 1) Product vision
Build a landing page + marketplace for the channel **“No Somos Ignorantes”** where a visitor:
1) Subscribes to the YouTube channel
2) Buys Excel digital products
3) Gets access to **“Mis compras”** (login area) to download products
4) Receives automated follow-up (Email + WhatsApp later)

**Core promise (anti-hype):**
Help people organize personal finances and early-stage business finances using Excel tools that work in real life.

---

## 2) 30-day measurable goals
- **Revenue target:** 10.000 Bs/month
- **Organic traffic:** grow through SEO + content
- **B2B leads:** start capturing leads for automations/services

**Primary visitor actions:**
- Subscribe to the channel (primary CTA)
- Buy a product (strong secondary CTA)
- Download the free lead magnet (email capture + activation)

---

## 3) Target audience (MVP)
**Age range:** 18–50  
**Main profiles:**
- People who struggle to organize personal finances
- Early-stage entrepreneurs who don’t know how to track operations

**Top needs:**
- Debt payoff and amortization tools
- Cashflow management (Bs/USD)
- Business financial structure
- Sales tracking and control

---

## 4) MVP product catalog (Spanish product names)
The marketplace supports **individual products** and **packs**.

### Finanzas personales
- **Comparador de créditos hipotecarios**
- **Bola de Nieve - Elimina tus deudas**
- **Amortizador de deudas PRO** (anchor product)
- **Analizador de puntaje crediticio**
- **Presupuesto 50/30/20** (FREE lead magnet)

### Emprendedores
- **Calculadora de costos indirectos**
- **Gestor de costo de ventas**
- **ARPU Calculadora**
- **Dual Cashflow (Bs/USD)** (anchor product)
- **Calculadora de precio de venta**
- **Registro de ventas con código único** (anchor product)
- **Full Financial Statements** (premium / anchor product)

**Pricing:** use the prices already defined in your local project folder (will be mapped in the spec).

---

## 5) What each purchase includes
- Excel file (digital product)
- Short video guide (Spanish)

---

## 6) Payments and delivery (MVP with bank transfer QR)
**Payment method:** bank transfer QR (no webhook).  
**QR asset (single source of truth):** `/assets/QR.jpg`

### MVP semi-automatic flow
1) User selects a product
2) User enters email and creates account (or logs in)
3) System creates an order (status: `pending_payment`)
4) Payment screen shows the QR **integrated into the UI** (not as a random image)
5) User uploads proof of payment (image)
6) Admin is notified (free channel for MVP)
7) Admin approves manually
8) System enables download in **“Mis compras”**
9) System emails an expiring download link

**Download link expiry:** 48 hours

---

## 7) Marketing automation (free for now)
Must be free/minimal-cost during MVP.

**Must-have:**
- Email sequence (welcome + upsell)
- WhatsApp follow-up (desired, but likely not free at scale)

**MVP realistic (free):**
- Admin notifications via Email (free) or Telegram (free)
- WhatsApp automation is Phase 2 (costs + templates + API constraints)

---

## 8) Brand voice and trust
- Tone: friendly, direct, anti-hype
- Credibility: experience-based
- Guarantee: none (for now)

---

## 9) Landing content architecture
The landing should include:
1) Hero: promise + Subscribe CTA + Marketplace CTA
2) “Top products” section (anchor products)
3) Free lead magnet section (**Presupuesto 50/30/20**)
4) “How it works” (3 steps: choose, pay, download)
5) Authority section (experience)
6) FAQ (QR payment, proof upload, downloads)
7) Final CTA (subscribe + buy)

---

## 10) Open decisions (to finalize before spec)
### 10.1 Packs strategy (recommended)
For MVP, keep it simple:
- 2 packs max to raise AOV without complexity:
  - Pack Personal Starter (based on debt + budget)
  - Pack Emprendedor Starter (cashflow + costs + pricing)
- Keep premium product as standalone initially:
  - Full Financial Statements

### 10.2 Login choice
Recommended for MVP:
- Magic link login (less friction, fewer support issues)

### 10.3 Admin notification channel (free)
Pick one for MVP:
- Email notifications (simple)
- Telegram bot notifications (free, fast)
WhatsApp is Phase 2.

---

## 11) Next document to write
`docs/project_spec.md`
- Project scope and pages
- Data model (orders, users, proofs, downloads)
- Storage and security (signed links, RLS)
- Admin review workflow
- Automation roadmap (MVP → Phase 2)
