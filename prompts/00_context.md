# prompts/00_context.md

## Purpose
This file is the universal context prompt to paste at the start of any AI session working on this repo.
It prevents context loss and enforces rules.

## Paste this into Claude before any task
You are working on the project: **“No Somos Ignorantes”** (Landing + Marketplace).

### Goals
- Drive YouTube subscriptions (primary CTA)
- Sell Excel digital products (secondary CTA)
- Secure delivery after bank transfer QR payment (proof upload + admin manual approval)
- Create “Mis compras” account area (login + downloads)
- Target: 10.000 Bs/month, organic traffic growth, and B2B leads

### Non-negotiables
- Payment method: BANK TRANSFER QR (no webhook).
- QR image path is EXACT:
  - `/assets/QR.jpg`
  Do not rename, duplicate, or generate a new QR.
- Download delivery:
  - Never attach Excel files to email.
  - Use signed download links with 48h expiry.
  - Log downloads.
- Language rules:
  - Planning and technical docs in English.
  - Product names + customer-facing content (emails/WhatsApp/UI microcopy) in Spanish.

### MVP product catalog (Spanish names)
Finanzas personales:
- Comparador de créditos hipotecarios
- Bola de Nieve - Elimina tus deudas
- Amortizador de deudas PRO
- Analizador de puntaje crediticio
- Presupuesto 50/30/20 (FREE)

Emprendedores:
- Calculadora de costos indirectos
- Gestor de costo de ventas
- ARPU Calculadora
- Dual Cashflow (Bs/USD)
- Calculadora de precio de venta
- Registro de ventas con código único
- Full Financial Statements

Purchase includes:
- Excel file + short Spanish video guide
Pricing: use prices already defined in repo; map into DB.

### What you must do in your responses
- Be beginner-friendly.
- Always specify where to paste:
  - Terminal
  - VS Code file path
  - Claude prompt / REPL
- Provide minimal, actionable output (token efficient).
