# Edge Functions for No Somos Ignorantes

These are Supabase Edge Functions (Deno/TypeScript) that handle server-side operations.

## Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy functions:
```bash
supabase functions deploy function-name
```

## Available Functions

### 1. send-welcome-email
Sends welcome email when user registers.

### 2. process-payment-webhook
Handles payment confirmations from payment providers.

### 3. generate-download-link
Creates secure, time-limited download links.

### 4. send-purchase-confirmation
Sends order confirmation with download links.

### 5. track-analytics
Records page views and user behavior.

## Environment Variables

Set these in your Supabase dashboard under Settings > Edge Functions:

```
RESEND_API_KEY=your_resend_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_secret
```

## Testing Locally

```bash
supabase functions serve function-name --env-file .env.local
```
