# prompts/30_checkout_qr.md

## Objective
Design the checkout experience for BANK TRANSFER QR (no webhook) with proof upload.
QR file must be integrated as a UI component (not a loose image).

## Non-negotiables
- QR image path: `/assets/QR.jpg` (exact)
- Proof upload is mandatory before review
- Manual admin approval required
- Delivery via signed link (48h expiry)
- Customer also gets access via “Mis compras”

## Required UI sections (Spanish microcopy)
1) Payment card with QR
- Title: “Paga por QR”
- Short instructions
- Amount / reference guidance
- Support contact line (optional)

2) Proof upload
- Label: “Sube tu comprobante”
- Accepted formats (define: jpg/png/pdf)
- Confirmation microcopy: “Recibimos tu comprobante. Lo revisaremos pronto.”

3) Status states (Spanish)
- `pending_payment`: “Pendiente de pago”
- `payment_review`: “En revisión”
- `paid`: “Aprobado”
- `fulfilled`: “Listo para descargar”
- `denied`: “Rechazado”

## Deliverables
- UI layout description (component hierarchy)
- Spanish microcopy for each section
- Error states (missing proof, invalid file, etc.)
- Token-efficient acceptance checklist

## Implementation guidance
- Always specify where code goes:
  - Terminal commands
  - VS Code file paths
