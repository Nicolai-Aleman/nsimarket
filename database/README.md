# No Somos Ignorantes - Complete Supabase Database Manual

> This is your step-by-step guide to set up the entire backend in Supabase.
> Follow every step in order. Do NOT skip anything.

---

## TABLE OF CONTENTS

1. [Create Your Supabase Project](#1-create-your-supabase-project)
2. [Understand the Supabase Dashboard](#2-understand-the-supabase-dashboard)
3. [Execute SQL Files (Step by Step)](#3-execute-sql-files-step-by-step)
4. [Configure Authentication](#4-configure-authentication)
5. [Set Up Storage Buckets](#5-set-up-storage-buckets)
6. [Create Your Admin User](#6-create-your-admin-user)
7. [Verify Everything Works](#7-verify-everything-works)
8. [Connect Your Website](#8-connect-your-website)
9. [Common Operations Reference](#9-common-operations-reference)
10. [Troubleshooting](#10-troubleshooting)
11. [Database Architecture Overview](#11-database-architecture-overview)
12. [Security Model Explained](#12-security-model-explained)
13. [Business Intelligence Queries](#13-business-intelligence-queries)

---

## 1. CREATE YOUR SUPABASE PROJECT

### Step 1.1: Sign Up
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### Step 1.2: Create New Project
1. Click **"New project"**
2. Fill in:
   - **Organization**: Select or create one (e.g., "No Somos Ignorantes")
   - **Name**: `no-somos-ignorantes` (or your preference)
   - **Database Password**: **WRITE THIS DOWN** - you'll need it later. Use a strong password
   - **Region**: Choose the closest to Bolivia: `South America (Sao Paulo)` recommended
   - **Plan**: Free tier is fine to start (500MB database, 1GB storage)
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for the project to be fully ready (you'll see a green "Project is ready" state)

### Step 1.3: Save Your Keys
Once the project is ready, go to **Settings > API** and save these values:
- **Project URL**: `https://xxxxxxxx.supabase.co` (you need this)
- **anon/public key**: `eyJhbGci...` (for your website frontend)
- **service_role key**: `eyJhbGci...` (**NEVER expose this publicly** - only for server-side)

> IMPORTANT: The `service_role` key bypasses ALL Row Level Security. Never put it in
> frontend code, never commit it to git, never share it publicly.

---

## 2. UNDERSTAND THE SUPABASE DASHBOARD

Here's what each section does:

| Section | What It Does | When You'll Use It |
|---------|-------------|-------------------|
| **Table Editor** | Visual view of your database tables | Browse/edit data, see products, users, purchases |
| **SQL Editor** | Run SQL queries directly | **This is where you'll paste all the SQL files** |
| **Authentication** | Manage user signups/logins | Set up login methods, view users |
| **Storage** | File hosting (your Excel files) | Upload products, payment proofs |
| **Edge Functions** | Server-side code | Future: email sending, webhooks |
| **Database** | Database settings, extensions | Verify extensions are enabled |
| **Settings > API** | Your project keys | Get URL and keys for your website |

### The SQL Editor (Your Main Tool)
1. Click **"SQL Editor"** in the left sidebar
2. You'll see a blank query editor
3. This is where you'll paste each SQL file
4. Click **"Run"** (or Ctrl+Enter) to execute
5. Green checkmark = success, Red X = error

---

## 3. EXECUTE SQL FILES (STEP BY STEP)

### CRITICAL RULES:
- Run files **ONE AT A TIME**, in exact order
- **Wait for each file to complete** before running the next
- If a file fails, **fix the error before continuing** (check Troubleshooting section)
- **Clear the SQL Editor** between files (select all > delete)
- The Supabase SQL Editor may show warnings like "The following potential issue has been detected" - this is normal for files that create triggers and SECURITY DEFINER functions. Click **"Run"** to proceed

---

### File 1: `01_schema_core.sql` - Foundation Tables

**What it creates:**
- `users` table (your customer database)
- `products` table (your Excel templates)
- `purchases` table (every transaction)
- `downloads` table (download tracking)
- `update_updated_at_column()` trigger function
- `generate_order_number()` function (NSI-2026-000001 format)
- All indexes for fast queries

**How to run:**
1. Open **SQL Editor**
2. Copy the ENTIRE contents of `01_schema_core.sql`
3. Paste into the editor
4. Click **"Run"**
5. Expected result: **"Success. No rows returned"**

**How to verify:**
1. Go to **Table Editor**
2. You should see 4 tables: `users`, `products`, `purchases`, `downloads`
3. Click on each to verify columns exist (they'll be empty - that's correct)

---

### File 2: `02_schema_marketing.sql` - Marketing Tables

**What it creates:**
- `user_interests` table (what topics users like)
- `email_campaigns` table (email templates)
- `email_events` table (track opens/clicks)
- `automation_logs` table (audit trail)
- `page_views` table (website analytics)
- `discount_codes` table (promo codes)

**How to run:**
1. **Clear the SQL Editor** (Ctrl+A, then Delete)
2. Copy the ENTIRE contents of `02_schema_marketing.sql`
3. Paste and click **"Run"**
4. Expected: **"Success. No rows returned"**

**How to verify:**
- Table Editor should now show 10 tables total

---

### File 3: `03_schema_membership.sql` - Membership & Affiliates

**What it creates:**
- `membership_tiers` table (Basic, Pro, VIP)
- `memberships` table (active subscriptions)
- `reviews` table (product reviews)
- `affiliates` table (affiliate partners)
- `affiliate_referrals` table (referral tracking)
- `affiliate_payouts` table (commission payments)
- **3 default membership tiers** (Basico: 29 Bs/mo, Pro: 79 Bs/mo, VIP: 199 Bs/mo)

**How to run:**
1. Clear the editor
2. Paste `03_schema_membership.sql`
3. Click **"Run"**
4. Expected: **"Success. No rows returned"**

**How to verify:**
1. Table Editor should now show 16 tables
2. Click on `membership_tiers` - you should see 3 rows (Basico, Pro, VIP)

---

### File 4: `04_security_rls.sql` - Row Level Security

**What it creates:**
- Enables RLS on ALL 16 tables
- `is_admin()` helper function
- `current_user_id()` helper function
- 25+ security policies that control who can see/edit what

**How to run:**
1. Clear the editor
2. Paste `04_security_rls.sql`
3. Click **"Run"**
4. Expected: **"Success. No rows returned"**

**How to verify:**
1. Go to **Authentication > Policies** (or Table Editor > click any table > "RLS" tab)
2. Each table should show "RLS Enabled" and have policies listed
3. For example, `products` should have:
   - "Anyone can view active products" (SELECT)
   - "Only admins can modify products" (ALL)

> WHAT RLS MEANS FOR YOU:
> - Anonymous visitors can see active products and membership tiers
> - Logged-in users can only see their OWN purchases, downloads, interests
> - Admin users (account_type = 'admin') can see everything
> - Your service_role key bypasses all RLS (for server-side operations)

---

### File 5: `05_functions_automations.sql` - Backend Logic

> This is the file that was giving you the error. It has been FIXED.

**What it creates:**
- `handle_new_user()` - Automatically creates user profile when someone signs up via Supabase Auth
- `process_completed_purchase()` - Updates all stats when admin confirms a payment
- `record_download()` - Logs downloads and enforces membership limits
- `process_affiliate_commission()` - Calculates and records affiliate commissions
- `track_user_interest()` - Records user interests for personalization
- `get_recommended_products()` - Returns personalized product recommendations
- `validate_discount_code()` - Validates promo codes
- `apply_discount_code()` - Marks a code as used
- Trigger: `on_auth_user_created` on `auth.users` table
- Trigger: `on_purchase_completed` on `purchases` table

**How to run:**
1. Clear the editor
2. Paste the **UPDATED** `05_functions_automations.sql` (the one we just fixed)
3. You WILL see a warning: "The following potential issue has been detected: Ensure that these are intentional before executing this query"
4. **This is NORMAL** - the warning appears because the file creates triggers on `auth.users` and uses `SECURITY DEFINER`. These are intentional
5. Click **"Run"** (or the "Run anyway" / continue button)
6. Expected: **"Success. No rows returned"**

**What was fixed (the bug you encountered):**
- The `COMMENT ON FUNCTION` statements at the bottom were missing parameter type signatures
- PostgreSQL identifies functions by name + parameter types
- `record_download()` (no params) != `record_download(UUID, UUID, UUID, VARCHAR, INET, TEXT)` (the actual function)
- Also fixed: `get_recommended_products` was referencing a column not in its CTE

---

### File 6: `06_user_flows.sql` - User Journey Functions

**What it creates:**
- `recent_registrations` view
- `process_free_download()` - Complete free download flow
- `create_purchase()` - Creates pending purchase with discount/affiliate handling
- `confirm_payment()` - Confirms payment (you call this as admin)
- `subscribe_membership()` - Membership signup
- `activate_membership()` - Activates after payment
- `get_user_dashboard()` - Returns all user data for their dashboard
- `capture_email_lead()` - Email capture from lead magnets
- `submit_review()` - Review submission with validation
- `approve_review()` - Admin approves review, updates product rating
- `track_affiliate_click()` - Records affiliate link clicks

**How to run:**
1. Clear the editor
2. Paste the **UPDATED** `06_user_flows.sql`
3. Click **"Run"**
4. Expected: **"Success. No rows returned"**

---

### File 7: `07_business_intelligence.sql` - Analytics

**What it creates:**
- 8 Views: `bi_best_selling_products`, `bi_sales_by_category`, `bi_most_active_users`, `bi_acquisition_sources`, `bi_free_to_paid_conversion`, `bi_avg_conversion_time`, `bi_topic_interests`, `bi_topics_that_convert`, `bi_product_content_correlation`, `bi_affiliate_performance`, `bi_top_affiliates_monthly`, `bi_email_campaign_performance`, `bi_user_engagement`, `bi_churn_risk`
- 4 Functions: `bi_sales_by_period()`, `bi_user_cohort_analysis()`, `bi_conversion_funnel()`, `bi_today_summary()`, `bi_monthly_summary()`

**How to run:**
1. Clear the editor
2. Paste `07_business_intelligence.sql`
3. Click **"Run"**
4. Expected: **"Success. No rows returned"**

**How to verify:**
- In SQL Editor, run: `SELECT * FROM bi_today_summary();`
- You should see 5 rows with zeros (no data yet)

---

### File 8: `08_seed_data.sql` - Your Products

**What it creates:**
- 13 products (6 personal finance + 5 entrepreneur + 2 packs)
- 3 discount codes (BIENVENIDO, YOUTUBE10, PRIMERPACK)
- 4 automated email campaign templates

**How to run:**
1. Clear the editor
2. Paste `08_seed_data.sql`
3. Click **"Run"**
4. Expected: **"Success. 13 rows returned"** (or similar)

**How to verify:**
1. Go to **Table Editor > products**
2. You should see 13 products with names like "Bola de Nieve", "Presupuesto Personal", etc.
3. Check **discount_codes** - 3 rows (BIENVENIDO, YOUTUBE10, PRIMERPACK)
4. Check **email_campaigns** - 4 rows

---

### File 9: `09_future_expansion.sql` - Optional Growth Tables

> This file creates tables for FUTURE features. You can run it now to prepare,
> or wait until you need these features.

**What it creates:**
- Course system tables (courses, modules, lessons, progress)
- Community/forum tables
- Gamification tables (achievements, points)
- Live events tables
- A/B testing tables
- Notification system tables

**How to run:**
1. Clear the editor
2. Paste `09_future_expansion.sql`
3. Click **"Run"**
4. Expected: **"Success. No rows returned"**

> NOTE: The RLS policies for these tables are commented out in the file.
> You'll enable them when you actually start using these features.

---

## 4. CONFIGURE AUTHENTICATION

### Step 4.1: Set Up Email Auth (Magic Link - Recommended for MVP)
1. Go to **Authentication > Providers**
2. **Email** should be enabled by default
3. Click on **Email** to configure:
   - **Enable Email Signup**: ON
   - **Enable Email Confirmations**: ON (for production) or OFF (for testing)
   - **Confirm Email**: Toggle ON for production
   - **Secure Email Change**: ON
4. Click **Save**

### Step 4.2: Configure Auth Email Templates (Spanish)
1. Go to **Authentication > Email Templates**
2. Edit each template to be in Spanish:

**Confirm Signup:**
- Subject: `Confirma tu email - No Somos Ignorantes`
- Body (replace the default):
```html
<h2>Bienvenido a No Somos Ignorantes!</h2>
<p>Haz clic en el enlace para confirmar tu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi email</a></p>
<p>Si no creaste esta cuenta, ignora este mensaje.</p>
```

**Magic Link:**
- Subject: `Tu link de acceso - No Somos Ignorantes`
- Body:
```html
<h2>Accede a tu cuenta</h2>
<p>Haz clic en el enlace para iniciar sesion:</p>
<p><a href="{{ .ConfirmationURL }}">Iniciar sesion</a></p>
<p>Este link expira en 24 horas.</p>
```

**Reset Password:**
- Subject: `Recupera tu contrasena - No Somos Ignorantes`
- Body:
```html
<h2>Recuperar contrasena</h2>
<p>Haz clic en el enlace para crear una nueva contrasena:</p>
<p><a href="{{ .ConfirmationURL }}">Recuperar contrasena</a></p>
```

3. Click **Save** after each template

### Step 4.3: Configure Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Set:
   - **Site URL**: `https://nosomosignorantes.com` (or your domain)
   - **Redirect URLs**: Add your website URLs:
     - `https://nosomosignorantes.com/`
     - `https://nosomosignorantes.com/dashboard`
     - `http://localhost:3000/` (for development)

---

## 5. SET UP STORAGE BUCKETS

### Step 5.1: Create "products" Bucket (for Excel files)
1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Configure:
   - **Name**: `products`
   - **Public**: **OFF** (private - files delivered via signed URLs)
   - **File size limit**: `50MB` (plenty for Excel files)
   - **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/zip`
4. Click **"Create bucket"**

### Step 5.2: Create "proofs" Bucket (for payment screenshots)
1. Click **"New bucket"** again
2. Configure:
   - **Name**: `proofs`
   - **Public**: **OFF** (private - only admin should see these)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, application/pdf`
3. Click **"Create bucket"**

### Step 5.3: Set Storage Policies

Go to **Storage > Policies** and set up:

**For "products" bucket:**
Run this in SQL Editor:
```sql
-- Allow admin to upload product files
CREATE POLICY "Admin can upload products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
        AND account_type = 'admin'
    )
);

-- Allow authenticated users to download (via signed URLs from functions)
CREATE POLICY "Authenticated users can download products"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'products');
```

**For "proofs" bucket:**
```sql
-- Anyone authenticated can upload payment proof
CREATE POLICY "Users can upload payment proof"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proofs');

-- Only admin can view proofs
CREATE POLICY "Admin can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'proofs'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
        AND account_type = 'admin'
    )
);
```

### Step 5.4: Upload Your Excel Files
1. Go to **Storage > products**
2. Create folders to organize:
   - Click **"Create folder"** > `personal` (for personal finance templates)
   - Click **"Create folder"** > `emprendedor` (for business templates)
   - Click **"Create folder"** > `packs` (for bundles)
3. Upload your Excel files into the appropriate folders
4. After uploading, right-click a file > **"Get URL"** > copy the path
5. Update the product in the `products` table with the `file_url`:

```sql
UPDATE public.products
SET file_url = 'products/personal/bola-de-nieve.xlsx'
WHERE slug = 'bola-de-nieve';
```

> Repeat for each product. The `file_url` should be the relative path inside the bucket.

---

## 6. CREATE YOUR ADMIN USER

### Step 6.1: Create Auth Account
1. Go to **Authentication > Users**
2. Click **"Add user"** > **"Create new user"**
3. Enter:
   - **Email**: Your admin email (e.g., `admin@nosomosignorantes.com`)
   - **Password**: A strong password
   - **Auto Confirm User**: YES (toggle on)
4. Click **"Create user"**
5. **Copy the User UID** that appears (it looks like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 6.2: Link to Your Users Table
The `handle_new_user()` trigger should have already created a row in `public.users`. But if you created the auth user before running file 05, you need to create the profile manually:

```sql
-- Check if the trigger already created the user:
SELECT * FROM public.users WHERE email = 'admin@nosomosignorantes.com';

-- If NOT found, insert manually:
INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    account_type,
    is_email_verified,
    acquisition_source
) VALUES (
    'PASTE-YOUR-AUTH-UID-HERE',
    'admin@nosomosignorantes.com',
    'Administrador',
    'admin',
    TRUE,
    'organic'
);

-- If found but not admin, upgrade:
UPDATE public.users
SET account_type = 'admin'
WHERE email = 'admin@nosomosignorantes.com';
```

### Step 6.3: Verify Admin Access
Run in SQL Editor:
```sql
SELECT id, email, account_type, auth_user_id
FROM public.users
WHERE account_type = 'admin';
```
You should see your admin user with `account_type = 'admin'`.

---

## 7. VERIFY EVERYTHING WORKS

Run these verification queries in **SQL Editor**:

### Check 1: Tables Exist (should return 16+ rows)
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check 2: Products Are Loaded (should return 13)
```sql
SELECT COUNT(*) as total_products FROM public.products;
SELECT name, slug, price_bolivianos, category, is_featured
FROM public.products ORDER BY display_order;
```

### Check 3: Discount Codes Work
```sql
SELECT code, discount_type, discount_value, is_active
FROM public.discount_codes;
```

### Check 4: Membership Tiers Exist (should return 3)
```sql
SELECT name, slug, price_monthly_bob, access_level
FROM public.membership_tiers ORDER BY access_level;
```

### Check 5: Functions Exist
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```
You should see 20+ functions listed.

### Check 6: RLS Is Active
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
All tables should show `rowsecurity = true`.

### Check 7: Today's Summary Works
```sql
SELECT * FROM bi_today_summary();
```

### Check 8: Validate Discount Code Function
```sql
-- Test with a product UUID from your products table:
SELECT id FROM public.products WHERE slug = 'presupuesto-personal' LIMIT 1;

-- Then test the discount code (replace the UUIDs):
-- SELECT * FROM validate_discount_code('YOUTUBE10', 'user-uuid', 'product-uuid', 59.00);
```

---

## 8. CONNECT YOUR WEBSITE

### Step 8.1: Install Supabase Client
If using npm:
```bash
npm install @supabase/supabase-js
```

Or include via CDN in your HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Step 8.2: Initialize the Client
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co'
const supabaseAnonKey = 'YOUR-ANON-KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 8.3: Authentication Examples
```javascript
// Sign up with email
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'securepassword',
    options: {
        data: {
            full_name: 'Juan Perez',
            source: 'youtube'
        }
    }
})

// Sign in with email
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'securepassword'
})

// Magic link (passwordless)
const { data, error } = await supabase.auth.signInWithOtp({
    email: 'user@example.com'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Step 8.4: Product Queries
```javascript
// Get all active products
const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

// Get featured products
const { data: featured } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('display_order')

// Get products by category
const { data: personal } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'personal')
    .eq('is_active', true)
```

### Step 8.5: Purchase Flow
```javascript
// 1. Create a pending purchase
const { data: purchase } = await supabase.rpc('create_purchase', {
    p_user_id: userId,
    p_product_id: productId,
    p_discount_code: 'YOUTUBE10',     // optional
    p_affiliate_code: null,            // optional
    p_payment_method: 'qr'
})
// Returns: { success, purchase_id, order_number, amount_to_pay, message }

// 2. Upload payment proof
const { data: proof } = await supabase.storage
    .from('proofs')
    .upload(`${purchase.purchase_id}/proof.jpg`, file)

// 3. Admin confirms payment (from admin dashboard)
const { data: confirmed } = await supabase.rpc('confirm_payment', {
    p_purchase_id: purchase.purchase_id,
    p_payment_reference: 'REF-12345'
})

// 4. Generate signed download URL (48-hour expiry)
const { data: downloadUrl } = await supabase.storage
    .from('products')
    .createSignedUrl('personal/bola-de-nieve.xlsx', 172800)
    // 172800 seconds = 48 hours
```

### Step 8.6: Free Download Flow
```javascript
const { data: download } = await supabase.rpc('process_free_download', {
    p_user_id: userId,
    p_product_id: freeProductId,
    p_ip_address: null,
    p_user_agent: navigator.userAgent
})
// Returns: { success, download_url, message }
```

---

## 9. COMMON OPERATIONS REFERENCE

### As Admin: Confirm a Payment
```sql
SELECT confirm_payment(
    'purchase-uuid-here',
    'bank-reference-number'
);
```

### As Admin: Approve a Review
```sql
SELECT approve_review('review-uuid-here');
```

### As Admin: Check Today's Sales
```sql
SELECT * FROM bi_today_summary();
```

### As Admin: See Monthly Revenue
```sql
SELECT * FROM bi_monthly_summary(2026, 2);
```

### As Admin: See Best Selling Products
```sql
SELECT * FROM bi_best_selling_products LIMIT 10;
```

### As Admin: See Conversion Funnel
```sql
SELECT * FROM bi_conversion_funnel();
```

### As Admin: See Where Users Come From
```sql
SELECT * FROM bi_acquisition_sources;
```

### As Admin: Find At-Risk Users
```sql
SELECT * FROM bi_churn_risk WHERE churn_risk = 'high';
```

### As Admin: See Pending Purchases (awaiting payment confirmation)
```sql
SELECT
    p.order_number,
    u.email,
    u.full_name,
    pr.name as product_name,
    p.price_paid,
    p.payment_method,
    p.created_at
FROM public.purchases p
JOIN public.users u ON p.user_id = u.id
JOIN public.products pr ON p.product_id = pr.id
WHERE p.payment_status = 'pending'
ORDER BY p.created_at DESC;
```

### As Admin: See User Engagement
```sql
SELECT * FROM bi_user_engagement ORDER BY engagement_score DESC LIMIT 20;
```

### Validate a Discount Code
```sql
SELECT * FROM validate_discount_code(
    'YOUTUBE10',          -- code
    'user-uuid',          -- user ID
    'product-uuid',       -- product ID
    59.00                 -- purchase amount
);
```

### Get Recommended Products for a User
```sql
SELECT * FROM get_recommended_products('user-uuid', 4);
```

### Get User Dashboard Data
```sql
SELECT * FROM get_user_dashboard('user-uuid');
```

### Content Ideas (for YouTube strategy)
```sql
-- What topics do users care about?
SELECT * FROM bi_topic_interests ORDER BY users_interested DESC;

-- Which topics lead to sales?
SELECT * FROM bi_topics_that_convert ORDER BY purchase_rate DESC;

-- Products with/without YouTube videos
SELECT * FROM bi_product_content_correlation;
```

---

## 10. TROUBLESHOOTING

### Error: "function public.record_download() does not exist"
**Cause**: The old `05_functions_automations.sql` had COMMENT statements with wrong function signatures (missing parameter types).
**Fix**: Use the updated file. The COMMENT lines now include proper signatures like `record_download(UUID, UUID, UUID, VARCHAR, INET, TEXT)`.

### Error: "relation already exists"
**Cause**: You're running a schema file that was already executed.
**Fix**: This is harmless. All tables use `CREATE TABLE IF NOT EXISTS`, so they won't be recreated. Functions use `CREATE OR REPLACE`, so they'll be updated.

### Error: "policy already exists"
**Cause**: RLS policies in `04_security_rls.sql` were already created.
**Fix**: Drop the policy first, then recreate:
```sql
DROP POLICY IF EXISTS "policy name" ON table_name;
-- Then re-run the CREATE POLICY statement
```

### Error: "permission denied for table auth.users"
**Cause**: The SQL Editor might not have permission to create triggers on `auth.users`.
**Fix**: This shouldn't happen in Supabase's built-in SQL Editor (it runs as superuser). If it does, check that you're using the SQL Editor, not an external connection.

### Warning: "The following potential issue has been detected"
**Cause**: Supabase detects potentially dangerous operations (triggers on auth tables, SECURITY DEFINER).
**Fix**: This is expected. These operations are intentional. Click "Run" to proceed.

### Products not showing on website
**Causes & fixes:**
1. Check `is_active = true` on products
2. Check RLS policy exists: "Anyone can view active products"
3. Check you're using the `anon` key (not `service_role`) from your frontend

### User can't see their purchases
**Causes & fixes:**
1. Verify the user is authenticated (logged in)
2. Check the `users` table has their `auth_user_id` linked
3. Verify RLS policy: "Users can view own purchases"

### Downloads not being tracked
**Cause**: The `record_download()` function needs to be called explicitly from your application code.
**Fix**: Call it via `supabase.rpc('record_download', {...})` when a user downloads.

### How to completely reset and start over
If you need to start fresh (development only!):
```sql
-- WARNING: This deletes ALL data and ALL tables
-- NEVER run this on production!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Then re-run all SQL files from 01 to 08
```

---

## 11. DATABASE ARCHITECTURE OVERVIEW

### Entity Relationship Summary

```
                    ┌──────────────────┐
                    │   auth.users     │ (Supabase built-in)
                    │   (login/auth)   │
                    └────────┬─────────┘
                             │ trigger: handle_new_user()
                             ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ user_interests│◄───│     users        │───►│  memberships │
│ (topics)     │    │ (profiles)       │    │ (subs)       │
└──────────────┘    └──┬──────────┬────┘    └──────┬───────┘
                       │          │                 │
                       ▼          ▼                 ▼
                ┌──────────┐ ┌──────────┐  ┌───────────────┐
                │purchases │ │ reviews  │  │membership_tiers│
                │(orders)  │ │(ratings) │  │(Basic/Pro/VIP)│
                └──┬───────┘ └──────────┘  └───────────────┘
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
   ┌──────────┐┌────────┐┌──────────────┐
   │downloads ││products││affiliates    │
   │(tracking)││(items) ││(referrals)   │
   └──────────┘└────────┘└──────┬───────┘
                                │
                    ┌───────────┼──────────┐
                    ▼           ▼          ▼
             ┌──────────┐┌──────────┐┌──────────┐
             │referrals ││payouts   ││discount  │
             │          ││          ││codes     │
             └──────────┘└──────────┘└──────────┘

Marketing Layer:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│email_campaigns│  │ email_events │  │ page_views   │
│(templates)   │  │ (tracking)   │  │ (analytics)  │
└──────────────┘  └──────────────┘  └──────────────┘

Audit:
┌──────────────────┐
│ automation_logs   │ (every automated action)
└──────────────────┘
```

### Table Count Summary
- **Core**: 4 tables (users, products, purchases, downloads)
- **Marketing**: 6 tables (interests, campaigns, events, logs, page_views, discount_codes)
- **Membership**: 6 tables (tiers, memberships, reviews, affiliates, referrals, payouts)
- **Future**: 13 tables (courses, community, gamification, events, A/B testing, notifications)
- **Total**: 16 active + 13 future = 29 tables

### Function Count Summary
- **Automation triggers**: 2 (handle_new_user, process_completed_purchase)
- **Core functions**: 6 (record_download, process_affiliate_commission, track_user_interest, get_recommended_products, validate_discount_code, apply_discount_code)
- **User flow functions**: 10 (process_free_download, create_purchase, confirm_payment, subscribe_membership, activate_membership, get_user_dashboard, capture_email_lead, submit_review, approve_review, track_affiliate_click)
- **BI functions**: 5 (bi_sales_by_period, bi_user_cohort_analysis, bi_conversion_funnel, bi_today_summary, bi_monthly_summary)
- **Utility functions**: 4 (update_updated_at_column, generate_order_number, is_admin, current_user_id)
- **Total**: 27 functions

---

## 12. SECURITY MODEL EXPLAINED

### How Row Level Security (RLS) Works

Think of RLS as a bouncer at a club. Every time someone tries to access data, PostgreSQL checks:
1. **Who is asking?** (anonymous, authenticated user, admin)
2. **What are they asking for?** (SELECT, INSERT, UPDATE, DELETE)
3. **Is there a policy that allows it?** (if no policy matches, ACCESS DENIED)

### Access Levels

| Who | Can See | Can Modify |
|-----|---------|-----------|
| **Anonymous** (not logged in) | Active products, active membership tiers, active discount codes, approved reviews | Nothing |
| **Authenticated User** | Everything anonymous can see + their own: purchases, downloads, interests, membership, affiliate data | Their own profile, interests, reviews |
| **Admin** (account_type='admin') | Everything | Everything |
| **Service Role Key** (server-side) | Bypasses ALL RLS | Bypasses ALL RLS |

### SECURITY DEFINER Functions
Functions marked `SECURITY DEFINER` run with the permissions of the function creator (superuser), not the calling user. This is how functions like `process_completed_purchase()` can update multiple tables even when the calling user only has limited permissions.

### Key Security Rules
1. **Never expose `service_role` key** in frontend JavaScript
2. **Always use `anon` key** in the browser
3. Users **cannot escalate** their own `account_type` (the UPDATE policy checks `auth_user_id = auth.uid()` but the `is_admin()` check in modification policies prevents non-admins from changing admin-controlled data)
4. **Payment confirmation** should only be done by admin (via dashboard or server-side with service_role key)

---

## 13. BUSINESS INTELLIGENCE QUERIES

### Your Daily Routine (run these every day)
```sql
-- Morning check: what happened today?
SELECT * FROM bi_today_summary();

-- Any pending purchases to approve?
SELECT p.order_number, u.email, pr.name, p.price_paid, p.created_at
FROM purchases p
JOIN users u ON p.user_id = u.id
JOIN products pr ON p.product_id = pr.id
WHERE p.payment_status = 'pending'
ORDER BY p.created_at;

-- Any reviews to approve?
SELECT r.rating, r.title, r.content, u.full_name, pr.name as product
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN products pr ON r.product_id = pr.id
WHERE r.is_approved = FALSE;
```

### Your Weekly Analysis
```sql
-- This week's sales
SELECT * FROM bi_sales_by_period(
    (CURRENT_DATE - INTERVAL '7 days')::DATE,
    CURRENT_DATE,
    'day'
);

-- Where are users coming from?
SELECT * FROM bi_acquisition_sources;

-- Top products
SELECT name, total_sales, total_revenue, average_rating
FROM bi_best_selling_products LIMIT 10;
```

### Your Monthly Strategy Meeting
```sql
-- Monthly summary
SELECT * FROM bi_monthly_summary(2026, 2);

-- Conversion funnel (how many free users become paid?)
SELECT * FROM bi_conversion_funnel();

-- Average time from free to paid
SELECT * FROM bi_avg_conversion_time;

-- Cohort analysis
SELECT * FROM bi_user_cohort_analysis('month');

-- Users at risk of leaving
SELECT * FROM bi_churn_risk WHERE churn_risk IN ('high', 'medium');

-- YouTube content ideas
SELECT * FROM bi_topic_interests ORDER BY users_interested DESC LIMIT 10;
SELECT * FROM bi_topics_that_convert ORDER BY purchase_rate DESC LIMIT 10;
```

---

## YOUR PURCHASE FLOW (How Money Comes In)

This is the exact flow for your QR bank transfer model:

```
CUSTOMER                          SUPABASE                         YOU (ADMIN)
   │                                 │                                │
   │ 1. Browses products            │                                │
   │ ────────────────────►          │                                │
   │     (reads products table)     │                                │
   │                                │                                │
   │ 2. Clicks "Comprar"           │                                │
   │ ────────────────────►          │                                │
   │     create_purchase()          │                                │
   │     → Creates pending order    │                                │
   │     → Returns order_number     │                                │
   │     → Returns amount_to_pay    │                                │
   │                                │                                │
   │ 3. Sees QR code (/assets/QR.jpg)                               │
   │    Scans with bank app         │                                │
   │    Transfers exact amount      │                                │
   │                                │                                │
   │ 4. Uploads payment proof       │                                │
   │ ────────────────────►          │                                │
   │     (uploads to proofs bucket) │                                │
   │                                │                                │
   │ 5. Waits for confirmation      │     6. You see pending order  │
   │                                │     ◄──────────────────────── │
   │                                │     You check payment proof   │
   │                                │     You verify bank received  │
   │                                │                                │
   │                                │     7. confirm_payment()      │
   │                                │     ◄──────────────────────── │
   │                                │     → Triggers:               │
   │                                │       • purchase → completed  │
   │                                │       • user stats updated    │
   │                                │       • product stats updated │
   │                                │       • affiliate commission  │
   │                                │                                │
   │ 8. Gets download access        │                                │
   │ ◄────────────────────          │                                │
   │    (signed URL, 48h expiry)    │                                │
   │                                │                                │
   │ 9. Downloads Excel file        │                                │
   │ ────────────────────►          │                                │
   │    record_download() logs it   │                                │
```

---

## WHAT'S NEXT AFTER DATABASE

Once your database is set up and verified:

1. **Upload all Excel product files** to the `products` Storage bucket
2. **Update `file_url`** for each product in the products table
3. **Connect your frontend** (the landing page) to Supabase using the JS client
4. **Test the complete flow**: Register > Browse > Buy > QR > Confirm > Download
5. **Build Excel templates** (we'll do this next!)

---

## QUICK REFERENCE CARD

| Task | SQL Command |
|------|------------|
| See all products | `SELECT * FROM products WHERE is_active = true;` |
| Pending orders | `SELECT * FROM purchases WHERE payment_status = 'pending';` |
| Confirm payment | `SELECT confirm_payment('uuid', 'ref');` |
| Today's sales | `SELECT * FROM bi_today_summary();` |
| Monthly revenue | `SELECT * FROM bi_monthly_summary(2026, 2);` |
| User's dashboard | `SELECT * FROM get_user_dashboard('uuid');` |
| Validate code | `SELECT * FROM validate_discount_code('CODE', 'user', 'product', 59);` |
| Best sellers | `SELECT * FROM bi_best_selling_products;` |
| Pending reviews | `SELECT * FROM reviews WHERE is_approved = FALSE;` |
| Approve review | `SELECT approve_review('uuid');` |
| User sources | `SELECT * FROM bi_acquisition_sources;` |
| At-risk users | `SELECT * FROM bi_churn_risk;` |
