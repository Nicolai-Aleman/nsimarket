# prompts/40_email_delivery.md

## Objective
Create Spanish email templates for the bank QR flow.

## Rules
- Spanish only (customer-facing)
- Never attach Excel files
- Include signed download link (expiring 48h)
- Mention “Mis compras” as alternative access

## Templates
1) Proof received
Subject: `Hemos recibido tu comprobante ✅`
Body:
- confirm receipt
- explain review process + expected time window
- link to “Mis compras” (no download yet)

2) Approved + download
Subject: `Tu compra está lista ✅ Descarga disponible (48h)`
Body:
- button/link
- expiry warning (48h)
- mention “Mis compras”
- support line

3) Rejected
Subject: `No pudimos validar tu pago ❗`
Body:
- what went wrong (generic)
- ask to re-upload proof
- support line

## Deliverables
- Subject lines
- Plain text + HTML-light version
- Placeholders:
  - {{product_name}}
  - {{download_link}}
  - {{expires_at}}
  - {{order_id}}
