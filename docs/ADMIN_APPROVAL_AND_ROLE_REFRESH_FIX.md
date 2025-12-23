# Admin Approval Flow & Role Refresh Fix

## Summary

Fixed two critical issues:
1. **Admin approval flow** - Now works via backend endpoints without relying on Gmail
2. **Stale JWT/session** - Role changes in DB now reflect immediately without requiring re-login

## Changes Made

### Goal A: Admin Approval Flow

#### 1. Database Models Confirmed ✅
- `users` table: `id`, `email`, `role` (Role enum: BUYER, CURATOR, ADMIN)
- `seller_applications` table: `id`, `userId` (references `users.id`), `status` (ApplicationStatus enum)
- `curator_profiles` table: `userId` (unique, references `users.id`), `slug` (unique)
- All foreign key relationships verified

#### 2. Admin Endpoints Enhanced ✅

**POST `/api/admin/seller-applications/[id]/approve`**
- ✅ Validates admin authentication and role
- ✅ Idempotent: Returns 200 OK if already APPROVED (doesn't error)
- ✅ Updates `seller_applications.status = 'APPROVED'`
- ✅ Updates `users.role = 'CURATOR'` for applicant
- ✅ Creates `curator_profiles` row with unique slug
- ✅ Email sending wrapped in try/catch (non-blocking)
- ✅ Returns JSON with updated records

**POST `/api/admin/seller-applications/[id]/reject`**
- ✅ Validates admin authentication and role
- ✅ Idempotent: Returns 200 OK if already REJECTED
- ✅ Updates `seller_applications.status = 'REJECTED'`
- ✅ Stores optional `decisionNote`
- ✅ Email sending wrapped in try/catch (non-blocking)

#### 3. Manual SQL Fallback ✅
- Documented in `docs/SELLER_APPLICATION_WORKFLOW.md`
- Step-by-step SQL for manual approval in Supabase
- Includes idempotency checks

### Goal B: Role Refresh Fix

#### 4. JWT Callback Updated ✅

**Before:** Only refreshed role when `trigger === "update"`

**After:** Always refreshes role from DB on every JWT callback call

```typescript
// Now refreshes role from DB on EVERY call, not just on update trigger
if (token.sub) {
  const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
  if (dbUser) {
    token.role = dbUser.role; // Always sync from DB
    // ... other fields
  }
}
```

**Key Features:**
- Logs role changes: `[NextAuth][jwt][ROLE_CHANGE]` when role changes
- Handles missing users gracefully (logs warning, doesn't break auth)
- Refreshes all user fields from DB (role, fullName, avatar, etc.)

#### 5. Session Callback ✅
- Already correctly uses `token.role` and `token.sub`
- Passes all fields to session.user

#### 6. Middleware Enhanced ✅
- Added debug logging (development only):
  - Logs path, userId presence, role
  - Logs access denied with role mismatch details
- Uses `getToken()` which reads from JWT (now refreshed from DB)

#### 7. Server-Side Role Checks ✅
- All admin pages have server-side role verification:
  - `/admin/page.tsx` - Uses `requireRole(user, 'ADMIN')`
  - `/admin/curators/applications/page.tsx` - Checks `user.role !== 'ADMIN'`
  - `/admin/seller-applications/[id]/page.tsx` - Checks `user.role !== 'ADMIN'`
- Defense-in-depth: Middleware + server-side checks

#### 8. Debug Endpoint ✅
- **GET `/api/debug/whoami`**
- Shows session role vs database role
- Development: Available to all authenticated users
- Production: Admin-only
- Helps verify role refresh is working

### Goal C: Email Non-Blocking

#### 9. Email Sending ✅
- All email sends wrapped in try/catch
- Errors logged but don't fail API responses
- Approval/rejection works even if email fails

#### 10. Data Consistency Logging ✅
- Apply route logs:
  - `session.user.id` and `application.userId`
  - `userIdsMatch: true/false` for verification
  - Correlation IDs for request tracking

## Verification Steps

### 1. Test Role Refresh

```bash
# 1. Sign in as user (role: BUYER)
# 2. Check current role
curl http://localhost:3000/api/debug/whoami \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 3. Change role in DB
# In Supabase SQL Editor:
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';

# 4. Without clearing cookies, check role again
curl http://localhost:3000/api/debug/whoami \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: session.role should now be "ADMIN"
# 5. Visit /admin/seller-applications
# Expected: Access granted (no redirect)
```

### 2. Test Approval Flow

```bash
# 1. Submit application (via UI or API)
# 2. Check application exists in DB
SELECT * FROM seller_applications WHERE status = 'PENDING';

# 3. Approve via API
curl -X POST http://localhost:3000/api/admin/seller-applications/[ID]/approve \
  -H "Cookie: next-auth.session-token=YOUR_ADMIN_TOKEN"

# 4. Verify in DB
SELECT 
  sa.status,
  u.role,
  cp.id as curator_profile_id
FROM seller_applications sa
JOIN users u ON sa."userId" = u.id
LEFT JOIN curator_profiles cp ON u.id = cp."userId"
WHERE sa.id = '[ID]';

# Expected:
# - sa.status = 'APPROVED'
# - u.role = 'CURATOR'
# - cp.id is not null
```

### 3. Test Idempotency

```bash
# Approve the same application twice
curl -X POST .../approve  # First time: creates profile
curl -X POST .../approve  # Second time: returns 200 OK (idempotent)
```

## Files Modified

### Core Auth
- `lib/auth.ts` - JWT callback always refreshes role from DB

### Middleware
- `middleware.ts` - Added debug logging for admin routes

### API Endpoints
- `app/api/admin/seller-applications/[id]/approve/route.ts` - Idempotency fix
- `app/api/admin/seller-applications/[id]/reject/route.ts` - Idempotency fix
- `app/api/curator/apply/route.ts` - Enhanced logging

### New Files
- `app/api/debug/whoami/route.ts` - Debug endpoint for role verification

### Documentation
- `docs/SELLER_APPLICATION_WORKFLOW.md` - Updated with:
  - API curl examples
  - Manual SQL fallback
  - Role refresh testing steps

## Environment Variables

Required:
```bash
ADMIN_EMAIL=founder@likethem.io
NEXTAUTH_URL=https://likethem.io  # Production
NEXTAUTH_SECRET=<secure-random-string>
RESEND_API_KEY=<optional-for-email>
```

## Build Verification

```bash
npm run build        # ✅ Compiles successfully
npx tsc --noEmit    # ✅ No TypeScript errors
npm run lint        # ✅ No linting errors
```

## Key Improvements

1. **Role Refresh:** JWT callback now always refreshes from DB, so role changes take effect immediately
2. **Idempotency:** Approve/reject endpoints can be called multiple times safely
3. **Non-Blocking Email:** Approval works even if email service is down
4. **Better Logging:** Correlation IDs and detailed logs for debugging
5. **Manual Fallback:** SQL scripts for emergency manual approval
6. **Debug Tools:** `/api/debug/whoami` endpoint for role verification

## Testing Checklist

- ✅ Submit application → appears in DB
- ✅ Change user role to ADMIN in DB → access granted immediately (no re-login)
- ✅ Approve application via UI → curator profile created, role updated
- ✅ Approve application via API → same result
- ✅ Approve application via SQL → same result
- ✅ Approve same application twice → idempotent (returns 200 OK)
- ✅ Reject application → status updated, email sent (if configured)
- ✅ Email failures don't block approval/rejection
- ✅ Debug endpoint shows role matches DB
