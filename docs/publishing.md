# Publishing — No Somos Ignorantes (Landing + Marketplace)

This document defines the **publishing workflow** for the static landing + marketplace project.

Language rule:
- This doc is in English (AI-friendly).
- Any customer-facing copy snippets remain in Spanish.

---

## 1) What “publishing” means in this project
Publishing = making the website publicly accessible (deploy), so users can:
- view landing + marketplace
- start checkout
- upload proof of payment
- access “Mis compras” downloads (once backend is connected)

For MVP we deploy the static site first, then progressively connect Supabase.

---

## 2) Environments
We use three environments (recommended):
- **Local** (your PC)
- **Staging** (test deploy)
- **Production** (public)

Environment variables should never be hard-coded inside `index.html` or committed.

---

## 3) Deployment options (choose one)
### Option A — GitHub Pages (simplest for pure static)
Use this if:
- Site is mostly static
- You are not using server-side rendering
- Supabase calls are client-side

Pros:
- Free and easy
Cons:
- No server runtime (edge functions still live in Supabase)

### Option B — Cloudflare Pages (recommended for static + speed)
Pros:
- Very fast global CDN
- Great for static sites
- Easy env vars support

### Option C — Vercel (best if you later move to Next.js)
Pros:
- Great dev experience
- Easy migration to Next.js
Cons:
- Might be overkill for pure static MVP

---

## 4) Required files before publishing
Ensure these exist:
- `index.html`
- `/css/*`
- `/js/*`
- `/assets/QR.jpg` (exact path, required)
- `docs/project_spec.md` and `Claude.md` (AI memory)

Also recommended:
- `robots.txt`
- `sitemap.xml`
- `favicon.ico`

---

## 5) Config checklist (pre-deploy)
### 5.1 SEO essentials
- Page title and meta description
- Open Graph tags for sharing
- Basic sitemap + robots
- Canonical URL

### 5.2 Analytics (optional but recommended)
- Track: subscribe click, marketplace click, lead magnet download, checkout start, proof upload

### 5.3 Security basics
- Ensure proof uploads go to Supabase Storage (not to the static host)
- Never expose storage public URLs for paid products
- Use signed URLs

---

## 6) Supabase connection checklist (before enabling real purchases)
Do not publish “Buy” as final until at least:
- Auth working (magic link)
- Orders table and proof upload working
- Admin review page reachable (restricted)
- “Mis compras” shows approved downloads
- Signed URLs expire after 48h

---

## 7) Local run (static)
### Where to paste
- These commands go in **Terminal** (VS Code terminal).

#### Option 1: Python simple server
```bash
cd /path/to/no-somos-ignorantes
python -m http.server 5173
