# Resume Prompt — No Somos Ignorantes Excel Build Session

**Copy and paste EVERYTHING below this line into a new Claude Code session:**

---

I am continuing a multi-session project for the brand "No Somos Ignorantes". Before doing anything, read these files to fully understand the project:

1. `claude/Claude.md` — Project memory with all constraints, product catalog, Supabase config, and agent roles
2. `excel_products/PRODUCT_SPECIFICATIONS.md` — Master spec for all 13 Excel products (design system, color palette, formulas, QA checklists)
3. `database/README.md` — Supabase manual (already complete)

## What has been completed

### Database (100% done)
- All 9 SQL files reviewed, 3 bugs fixed (parameter signatures in COMMENT ON FUNCTION statements)
- Files: `database/01_schema_core.sql` through `database/09_future_expansion.sql`
- Comprehensive Supabase manual: `database/README.md`
- Supabase public keys saved in `claude/.env`

### Excel Products (5 of 13 done)
Each Excel follows the brand design system: Gold (#D4AF37) headers, Dark (#1A1A2E) banners, blue input text, yellow input cells, green output cells, sheet protection (password: nsi2024), data validation, conditional formatting, and charts.

| # | Product | Price | File | Formulas | Charts | Status |
|---|---------|-------|------|----------|--------|--------|
| 1 | Presupuesto 50/30/20 | FREE | `Presupuesto_50_30_20_NSI.xlsx` | 56 | 2 | DONE |
| 2 | Bola de Nieve - Elimina tus Deudas | Bs. 49 | `Bola_de_Nieve_NSI.xlsx` | 417 | 3 | DONE |
| 3 | Comparador de Creditos Hipotecarios | Bs. 49 | `Comparador_Hipotecario_NSI.xlsx` | 2,657 | 5 | DONE |
| 4 | Amortizador de Deudas PRO | Bs. 69 | `Amortizador_Deudas_PRO_NSI.xlsx` | 7,805 | 10 | DONE |
| 5 | Analizador de Puntaje Crediticio | Bs. 39 | `Analizador_Puntaje_Crediticio_NSI.xlsx` | 111 | 4 | DONE |

Build scripts are in `excel_products/build_*.py` — use these as reference for style patterns, color palette, and helper functions.

### Remaining Excel Products to Build (8 of 13)

Build them in this order, following the specs in `PRODUCT_SPECIFICATIONS.md`:

| # | Product | Price | Spec Section |
|---|---------|-------|--------------|
| 6 | Sistema de Ventas con Codigo Unico | Bs. 89 | Product 6 |
| 7 | Control de Gastos Operativos | Bs. 59 | Product 7 |
| 8 | Calculadora de Costos Indirectos | Bs. 69 | Product 8 |
| 9 | Gestor de Costo de Ventas | Bs. 59 | Product 9 |
| 10 | Calculadora de ARPU | Bs. 49 | Product 10 |
| 11 | Flujo de Caja Dual Bs/USD | Bs. 99 | Product 11 |
| 12 | Calculadora de Precio de Venta | Bs. 49 | Product 12 |
| 13 | Estados Financieros Completos | Bs. 199 | Product 13 (premium anchor) |

## Build Rules (non-negotiable)

1. **Use Excel formulas, NEVER hardcode calculated values** — the spreadsheet must be dynamic
2. **Follow the brand design system** from PRODUCT_SPECIFICATIONS.md Part A (colors, formatting, borders)
3. **All customer-facing text in Spanish** (product names, labels, instructions, error messages)
4. **Sheet protection** with password `nsi2024` — lock formulas, unlock only input cells
5. **Data validation** on all input cells (prevent negatives, enforce ranges, show Spanish prompts)
6. **Conditional formatting** for visual feedback (green/red status, data bars, color scales)
7. **Charts and dashboards** where they add value — bar, line, pie, radar, stacked charts
8. **IFERROR()** wrapping on complex formulas to prevent #DIV/0! and #REF! errors
9. **Verify every build**: count formulas, check for static errors, list charts and protected sheets
10. **Output naming**: `excel_products/[ProductName]_NSI.xlsx`
11. **Improve beyond the spec** — add KPIs, what-if analysis, sensitivity tables, visual indicators, and professional touches that make each product best-in-class
12. **Use the xlsx skill** for openpyxl patterns and recalc.py (note: LibreOffice may not be installed on Windows — verify formulas with Python instead)

## Key Technical Notes

- openpyxl DeprecationWarning on `.protection.copy(locked=False)` is cosmetic only — does not affect output
- Merged cells: never write to a cell that's covered by a merge — write to the anchor cell only
- Charts reference data via `Reference()` objects — ensure sheet exists before adding chart data from it
- Max 360 rows for amortization tables, 60-120 for month-by-month plans
- File naming: `build_[product_slug].py` for scripts, `[ProductName]_NSI.xlsx` for output

## Start

Read the 3 files listed above, then start building **Product 6: Sistema de Ventas con Codigo Unico** (Bs. 89). Use all your skills to make the best possible version with dashboards, charts, VLOOKUP-powered auto-fill, inventory tracking, and professional UX. After finishing each product, verify formulas and move to the next one.
