# Seller Application Admin Workflow

## Overview

Complete admin notification and approval workflow for seller/curator applications.

## Components

### 1. Email Notification (`lib/mailer.ts`)

When a seller application is submitted:
- Email is sent to `ADMIN_EMAIL` (configured in environment variables)
- Email includes:
  - Applicant full name
  - Applicant email
  - Audience size
  - Reason/motivation text
  - Application ID
  - Link to admin review page (`/admin/seller-applications`)

**Logging:**
```
[SELLER_APPLY][EMAIL] sent to ADMIN_EMAIL: founder@likethem.io
```

### 2. Admin Review UI

**Route:** `/admin/seller-applications` (redirects to `/admin/curators/applications`)

**Features:**
- Lists all seller applications
- **PENDING applications shown first** (sorted by status, then by date)
- Status badges with color coding:
  - ⏳ PENDING (yellow)
  - ✅ APPROVED (green)
  - ❌ REJECTED (red)
- Actions column with:
  - "View Details" link
  - "Approve" button (PENDING only)
  - "Reject" button (PENDING only)

**Access Control:**
- Protected by middleware (admin role required)
- Server-side role check in page component

### 3. Application Detail Page

**Route:** `/admin/seller-applications/[id]`

**Features:**
- Full application details
- Applicant information
- Reason/motivation text
- Application metadata (ID, dates, decision notes)
- Approve/Reject actions (if PENDING)

### 4. Approval API

**Endpoint:** `POST /api/admin/seller-applications/[id]/approve`

**Actions:**
1. Validates admin authentication
2. Checks application status (must be PENDING)
3. Creates curator profile with:
   - Store name (from applicant full name)
   - Unique slug
   - Bio (from application reason)
4. Updates user role to `CURATOR`
5. Updates application status to `APPROVED`
6. Sends approval email to applicant
7. Returns success response

**Idempotency:**
- If user already has curator profile, only updates application status
- Prevents duplicate profile creation

### 5. Rejection API

**Endpoint:** `POST /api/admin/seller-applications/[id]/reject`

**Actions:**
1. Validates admin authentication
2. Checks application status (must be PENDING)
3. Updates application status to `REJECTED`
4. Stores optional decision note
5. Sends rejection email to applicant (with optional feedback)
6. Returns success response

## Environment Variables

Required:
```bash
ADMIN_EMAIL=founder@likethem.io
RESEND_API_KEY=<your-resend-api-key>
NEXTAUTH_URL=https://likethem.io
```

## Verification Checklist

- ✅ Submitting application sends email to ADMIN_EMAIL
- ✅ Email includes all required information and admin review link
- ✅ Admin can view applications list at `/admin/seller-applications`
- ✅ PENDING applications appear first in the list
- ✅ Admin can view application details
- ✅ Admin can approve via UI (creates curator profile, updates role)
- ✅ Admin can reject via UI (updates status, sends email)
- ✅ Approved user gains CURATOR role and access
- ✅ Status updates correctly in database
- ✅ Emails sent to applicants on approval/rejection

## API Endpoints

### Approve Application
```typescript
POST /api/admin/seller-applications/[id]/approve
Headers: { Cookie: "next-auth.session-token=..." }
Response: { ok: true, message: "...", applicationId: "...", curatorProfileId: "..." }
```

### Reject Application
```typescript
POST /api/admin/seller-applications/[id]/reject
Headers: { Cookie: "next-auth.session-token=..." }
Body: { decisionNote?: string }
Response: { ok: true, message: "...", applicationId: "..." }
```

## Database Changes

On Approval:
- `seller_applications.status` → `APPROVED`
- `seller_applications.reviewedBy` → admin user ID
- `seller_applications.reviewedAt` → current timestamp
- `users.role` → `CURATOR`
- `curator_profiles` → new record created

On Rejection:
- `seller_applications.status` → `REJECTED`
- `seller_applications.reviewedBy` → admin user ID
- `seller_applications.reviewedAt` → current timestamp
- `seller_applications.decisionNote` → optional feedback

## Files Created/Modified

### New Files
- `app/api/admin/seller-applications/[id]/approve/route.ts`
- `app/api/admin/seller-applications/[id]/reject/route.ts`
- `app/admin/seller-applications/[id]/page.tsx` (detail page)
- `app/admin/seller-applications/page.tsx` (redirect)
- `app/admin/curators/applications/ApplicationActions.tsx` (client component)

### Modified Files
- `lib/mailer.ts` - Updated to use ADMIN_EMAIL and include admin review link
- `app/api/curator/apply/route.ts` - Updated email notification call
- `app/admin/curators/applications/page.tsx` - Updated to show PENDING first and use new API endpoints

## Approval Methods

### Method 1: Via Admin UI (Recommended)

1. Navigate to `/admin/seller-applications` (or `/admin/curators/applications`)
2. Find the PENDING application
3. Click "View Details" to review full application
4. Click "Approve" or "Reject" button
5. For rejection, optionally enter a decision note

### Method 2: Via API Endpoint

**Approve via cURL:**
```bash
# Get your session cookie from browser DevTools → Application → Cookies
# Look for: next-auth.session-token

curl -X POST https://likethem.io/api/admin/seller-applications/[APPLICATION_ID]/approve \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**Reject via cURL:**
```bash
curl -X POST https://likethem.io/api/admin/seller-applications/[APPLICATION_ID]/reject \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decisionNote": "Optional feedback message"}'
```

**Response (Approve):**
```json
{
  "ok": true,
  "message": "Application approved successfully",
  "applicationId": "...",
  "curatorProfileId": "..."
}
```

**Response (Reject):**
```json
{
  "ok": true,
  "message": "Application rejected successfully",
  "applicationId": "..."
}
```

### Method 3: Manual SQL Fallback (Supabase)

If the API endpoints are unavailable, you can manually approve via SQL:

```sql
-- Step 1: Get the application details
SELECT id, "userId", "fullName", reason, status 
FROM seller_applications 
WHERE id = 'APPLICATION_ID_HERE';

-- Step 2: Update application status
UPDATE seller_applications
SET 
  status = 'APPROVED',
  "reviewedAt" = NOW(),
  "reviewedBy" = 'ADMIN_USER_ID_HERE'  -- Replace with your admin user ID
WHERE id = 'APPLICATION_ID_HERE';

-- Step 3: Update user role to CURATOR
UPDATE users
SET role = 'CURATOR'
WHERE id = 'APPLICANT_USER_ID_HERE';  -- From Step 1

-- Step 4: Create curator profile (if it doesn't exist)
-- First, generate a unique slug from the full name
-- Example: "John Doe" → "john-doe" (or "john-doe-2" if exists)

INSERT INTO curator_profiles (
  id,
  "userId",
  "storeName",
  slug,
  bio,
  "isPublic",
  "isEditorsPick",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid()::text,  -- Or use cuid() equivalent
  'APPLICANT_USER_ID_HERE',
  'Store Name Here',  -- Use fullName from application
  'unique-slug-here',  -- Generate from store name, check uniqueness
  'Bio text here',  -- Optional: use reason from application
  true,
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM curator_profiles WHERE "userId" = 'APPLICANT_USER_ID_HERE'
);
```

**Important Notes:**
- Always verify the `userId` matches between `seller_applications` and `users` tables
- Ensure slug is unique (check existing slugs first)
- The curator profile creation should be idempotent (use `WHERE NOT EXISTS`)

## Role Refresh Testing

### Test Plan: Verify Role Changes Reflect Immediately

1. **Initial State:**
   - Sign in as user A (currently BUYER role)
   - Visit `/api/debug/whoami` to see current session role
   - Expected: `session.role = "BUYER"`, `database.role = "BUYER"`

2. **Change Role in Database:**
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'user-a@example.com';
   ```

3. **Verify Role Refresh (Without Clearing Cookies):**
   - Refresh `/api/debug/whoami` endpoint
   - Expected: `session.role = "ADMIN"`, `database.role = "ADMIN"`, `match.roleMatches = true`
   - Visit `/admin/seller-applications`
   - Expected: Access granted (no redirect to /unauthorized)

4. **If Role Doesn't Refresh:**
   - Check JWT callback logs for `[NextAuth][jwt][ROLE_CHANGE]`
   - Verify `token.sub` matches the user ID
   - Check middleware logs for `[MIDDLEWARE][ADMIN]` entries
   - Clear cookies and sign in again (last resort)

### Debug Endpoint

**GET `/api/debug/whoami`**

Returns current session role vs database role for debugging:

```json
{
  "session": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "ADMIN",
    "fullName": "User Name"
  },
  "database": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "ADMIN",
    "fullName": "User Name"
  },
  "match": {
    "roleMatches": true,
    "idMatches": true
  },
  "debug": true
}
```

**Access:**
- Development: Available to all authenticated users
- Production: Admin-only

## Testing

1. **Submit Application:**
   - User submits application via `/apply`
   - Check logs for `[CURATOR_APPLY][...][SUCCESS]` with `userIdsMatch: true`
   - Check logs for `[SELLER_APPLY][EMAIL] sent to ADMIN_EMAIL`
   - Verify application appears in Supabase `seller_applications` table

2. **Admin Review:**
   - Admin logs in and navigates to `/admin/seller-applications`
   - Verify PENDING applications appear first
   - Click "View Details" to see full application

3. **Approve:**
   - Click "Approve" button OR use API endpoint OR use SQL
   - Verify in Supabase:
     - `seller_applications.status = 'APPROVED'`
     - `users.role = 'CURATOR'` for applicant
     - `curator_profiles` row exists for applicant
   - Verify applicant receives approval email (if email configured)

4. **Reject:**
   - Click "Reject" button OR use API endpoint
   - Enter optional decision note
   - Verify in Supabase:
     - `seller_applications.status = 'REJECTED'`
     - `seller_applications.decisionNote` contains note (if provided)
   - Verify applicant receives rejection email (if email configured)

5. **Role Refresh Test:**
   - Change user role in DB to ADMIN
   - Without clearing cookies, check `/api/debug/whoami`
   - Verify role matches DB
   - Access `/admin/seller-applications` - should work immediately
