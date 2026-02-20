# Changelog — No Somos Ignorantes (Landing + Marketplace)

All planning docs are written in **English** to reduce AI confusion.
Exception: **product names** and **customer-facing messages** (email/WhatsApp/UI microcopy) are written in **Spanish**.

---

## [0.2.0] — 2026-02-05
### Added
- Formal planning docs structure:
  - `docs/brainstorm.md`
  - `docs/project_spec.md`
  - `docs/architecture.md`
  - `docs/project_status.md`
  - `docs/changelog.md`
- Defined MVP flow for **bank transfer QR (no webhook)**:
  - proof upload
  - admin manual approval
  - secure delivery via signed links (48h)
- Locked QR asset path as single source of truth:
  - `/assets/QR.jpg`

### Changed
- Project architecture upgraded to “AI-first” format:
  - Added `/docs`, `/prompts`, `/agents`
  - Separated concerns (landing, excel, supabase, QA)

### Notes
- WhatsApp automation is moved to Phase 2 (cost + constraints).
- MVP admin notifications should be Email or Telegram (free-first).

---

## [0.1.0] — 2026-02-04
### Added
- Initial landing + marketplace static structure:
  - `index.html`, `/css`, `/js`, `/assets`
- Initial `database/` SQL file set (01–09)
- Initial product set under `excel_products/`
- Early documentation files:
  - `GUIA-PUBLICACION.md`
  - `GOOGLE-APPS-SCRIPT.md`
