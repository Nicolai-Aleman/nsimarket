# Claude.md — Project Memory (No Somos Ignorantes)

This file is the **single, always-updated project memory** for AI work.
Keep it short, precise, and enforce constraints.

---

## 1) Project summary
We are building a landing page + marketplace for the brand **“No Somos Ignorantes”** to:
- Drive YouTube subscriptions
- Sell Excel digital products
- Deliver products securely after **bank transfer QR** payments
- Support a customer area: **“Mis compras”** (login + downloads)

---

## 2) Non-negotiable constraints
### 2.1 Payment method
- Payment is **BANK TRANSFER QR** (NOT a gateway).
- There is **NO bank webhook confirmation**.
- MVP must support: proof upload + manual admin approval.

### 2.2 QR asset (single source of truth)
- QR image path is **exactly**:
  - `/assets/QR.jpg`
- Do NOT rename it.
- Do NOT duplicate it.
- Do NOT generate a new QR.

### 2.3 Language rules (to avoid AI confusion)
- All `.md` planning docs must be in **English**.
- Exceptions that must be in **Spanish**:
  - Product names
  - Customer-facing content: emails, WhatsApp messages, UI microcopy

### 2.4 Delivery security
- Never attach Excel files to email.
- Use signed download links (Supabase Storage) with:
  - **48 hours expiry**
- Log downloads.

---

## 3) MVP goals and metrics
- Revenue goal: **10.000 Bs/month**
- Growth: organic traffic + content
- Capture: B2B leads (future services)

Primary CTA: subscribe to YouTube  
Secondary CTA: buy products  
Lead magnet: **Presupuesto 50/30/20** (free)

---

## 4) MVP product catalog (Spanish names)
### Finanzas personales
- Comparador de créditos hipotecarios
- Bola de Nieve - Elimina tus deudas
- Amortizador de deudas PRO (anchor)
- Analizador de puntaje crediticio
- Presupuesto 50/30/20 (FREE lead magnet)

### Emprendedores
- Calculadora de costos indirectos
- Gestor de costo de ventas
- ARPU Calculadora
- Dual Cashflow (Bs/USD) (anchor)
- Calculadora de precio de venta
- Registro de ventas con código único (anchor)
- Full Financial Statements (premium anchor)

Purchase includes:
- Excel file + short Spanish video guide

Pricing:
- Use prices already defined in local project folder; map them into `products` table.

---

## 5) MVP user journeys (short)
### Buyer flow
1) Choose product
2) Login (magic link recommended)
3) Create order `pending_payment`
4) Show QR (UI component)
5) Upload proof → `payment_review`
6) Admin approves
7) Enable download in “Mis compras”
8) Send Spanish email with expiring link (48h)

### Admin flow
- Receive free notification when proof uploaded
- Review proof
- Approve / deny

---

## 6) Repo structure (target)
/(LANDING-PAGE_MARKETPLACE)
index.html
/css
/js
/assets
/excel_products
/database
/docs
/prompts
/agents
Claude.md
README.md
.env.example
/.claude


---

## 7) Supabase configuration
- **Project URL**: `https://pqngizfunuypvxdlsddd.supabase.co`
- **Anon Key**: `sb_publishable_kJHOR18Sp0oZtNDVBHjK2g_D28cBhbm` (safe for frontend)
- **Service Role Key**: Saved offline (password manager / paper). NEVER in code.
- **Region**: South America (Sao Paulo)
- **Database status**: All 9 SQL files ready, bugs fixed, comprehensive guide in database/README.md

---

## 8) Agent roles (token-efficient)
### landing_builder
- Landing + marketplace UI
- QR integrated as a payment card component
- Spanish UI microcopy only where user sees it

### excel_builder
- One Excel product per run
- Always: spec + sheet blueprint + formulas/logic + QA checklist
- Product names remain Spanish

### supabase_fixer
- SQL schema + RLS + storage buckets + signed URLs
- Fix errors like missing functions/triggers
- Minimal diffs; do not rewrite everything unnecessarily

### qa_checklist
- Test plan for: auth, orders, proof upload, admin approve, downloads, expiry
