# Curator Application Authentication Fix

## Problem
Users were getting "Authentication required" error when submitting curator applications on `/apply` page, even though they were clearly logged in (header avatar visible).

## Root Causes Identified

### 1. Missing `credentials: 'include'` in Client Request
**Location:** `app/apply/ApplicationForm.tsx` line 42

**Issue:** The fetch request was not including cookies, so the authentication session cookie was not being sent to the server.

**Fix:** Added `credentials: 'include'` to the fetch options.

### 2. Using `getToken` Instead of `getServerSession`
**Location:** `app/api/curator/apply/route.ts` line 19

**Issue:** The route was using `getToken` from `next-auth/jwt` which:
- Requires manual secret handling
- May not correctly read the session cookie
- Token structure might not match expected format (`token.id` vs `token.sub`)

**Fix:** Changed to use `getServerSession(authOptions)` which:
- Automatically reads cookies from the request
- Uses the same auth configuration as the rest of the app
- Returns a properly structured session object with `session.user.id`

## Changes Made

### Client-Side (`app/apply/ApplicationForm.tsx`)
```typescript
// Before
const res = await fetch('/api/curator/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// After
const res = await fetch('/api/curator/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ✅ Added: Ensures cookies are sent
  body: JSON.stringify(data),
});
```

### Server-Side (`app/api/curator/apply/route.ts`)
```typescript
// Before
import { getToken } from 'next-auth/jwt';
const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
if (!token?.id) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
// Used: token.id, token.email

// After
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
// Uses: session.user.id, session.user.email
```

### Enhanced Logging
Added comprehensive logging with correlation IDs to help debug authentication issues:
- Request URL, host, origin, referer
- Cookie header presence and length
- Session validation status
- User ID and email presence

## Verification Steps

### 1. Test Logged-In User
1. Sign in to the application
2. Navigate to `/apply`
3. Fill out the application form
4. Submit the form
5. **Expected:** Application submits successfully (200 OK)
6. **Check logs:** Should see `[CURATOR_APPLY][...][SUCCESS]` messages

### 2. Test Logged-Out User
1. Sign out or use incognito mode
2. Navigate to `/apply`
3. Try to submit the form
4. **Expected:** "Authentication required" error (401)
5. **Check logs:** Should see `[CURATOR_APPLY][...][ERROR] No session or user ID found`

### 3. Verify Session Endpoint
Before submitting, verify session is available:
```javascript
// In browser console on /apply page
fetch('/api/auth/session', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);
// Should return: { user: { id: "...", email: "..." } }
```

### 4. Check Network Tab
1. Open DevTools → Network
2. Submit application
3. Check the `/api/curator/apply` request:
   - **Request Headers:** Should include `Cookie` header with `next-auth.session-token`
   - **Response:** Should be 200 OK with `{ ok: true, applicationId: "..." }`

## Regression Checks

- ✅ Logged-out user: Returns 401 with "Authentication required"
- ✅ Logged-in user: Returns 200 and creates application
- ✅ Same-origin requests: Works correctly (relative URLs)
- ✅ Cross-origin requests: Should not occur (all requests are same-origin)
- ✅ Cookie domain: Correctly set (no explicit domain = current domain)
- ✅ Cookie path: Set to `/` (available site-wide)

## Middleware Configuration

The middleware correctly allows `/api/curator/apply` through after authentication check:
```typescript
const authPaths = ["/api/curator/apply"];
// Middleware checks token, then allows request through
// API route then validates session more thoroughly
```

## Related Files

- `app/apply/ApplicationForm.tsx` - Client form component
- `app/api/curator/apply/route.ts` - API route handler
- `lib/auth.ts` - NextAuth configuration (used by getServerSession)
- `middleware.ts` - Route protection middleware

## Notes

- All other API routes in the codebase use `getServerSession(authOptions)` pattern
- This fix aligns the apply route with the rest of the application
- Enhanced logging will help diagnose any future authentication issues
- Cookies are automatically included with `credentials: 'include'` in same-origin requests
