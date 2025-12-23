# Google OAuth Sign-In Fix Summary

## Root Cause Analysis

### Primary Root Cause
**Missing or incorrect `NEXTAUTH_SECRET` environment variable** - This is the most likely cause of OAuth callback failures. NextAuth.js requires `NEXTAUTH_SECRET` for:
- JWT token signing
- State parameter encryption (OAuth security)
- CSRF token generation

Without it, OAuth callbacks fail with generic "Callback" errors.

### Contributing Causes Found

1. **Conflicting Auth Configurations**
   - Two different auth config files existed:
     - `lib/auth.ts` (active, used by route handler)
     - `app/api/auth/[...nextauth]/auth.ts` (unused duplicate)
   - Some files imported from the wrong location
   - **Fixed:** Consolidated to single config, updated all imports

2. **Missing Cookie Configuration**
   - No explicit cookie settings for OAuth
   - Default SameSite settings could break OAuth redirects
   - **Fixed:** Added explicit cookie config with `SameSite: 'lax'` and proper Secure flags

3. **Multiple PrismaClient Instances**
   - `lib/auth.ts` created new PrismaClient instead of using shared instance
   - Could cause connection pool exhaustion
   - **Fixed:** Now uses shared `@/lib/prisma` instance

4. **Insufficient Error Logging**
   - Generic error messages made debugging difficult
   - No correlation IDs for request tracking
   - **Fixed:** Added comprehensive logging with correlation IDs

5. **Missing Environment Variable Validation**
   - No runtime checks for required env vars
   - Silent failures when vars missing
   - **Fixed:** Added validation with clear error messages

## Files Changed

### Core Auth Configuration
- **`lib/auth.ts`** - Complete rewrite:
  - Added environment variable validation
  - Added explicit cookie configuration
  - Fixed PrismaClient usage (shared instance)
  - Enhanced error logging
  - Improved JWT/session callbacks
  - Added credentials provider support

### Route Handler
- **`app/api/auth/[...nextauth]/route.ts`** - Enhanced:
  - Added correlation IDs for request tracking
  - Improved error logging
  - Added environment variable checks in logs
  - Better OAuth callback success logging

### Sign-In Page
- **`app/auth/signin/page.tsx`** - Improved:
  - More descriptive error messages
  - Added handling for additional error codes
  - Better user-facing error descriptions

### Import Fixes
- **`app/api/products/[slug]/route.ts`** - Fixed import
- **`app/api/curator/profile/route.ts`** - Fixed import
- **`app/api/upload/route.ts`** - Fixed import
- **`app/api/account/update/route.ts`** - Fixed import

### Documentation
- **`docs/OAUTH_TROUBLESHOOTING.md`** - Comprehensive troubleshooting guide
- **`docs/OAUTH_FIX_SUMMARY.md`** - This file

## Required Environment Variables

### Production (Vercel)
```bash
NEXTAUTH_URL=https://likethem.io
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
DATABASE_URL=<postgres-connection-string>
DIRECT_URL=<postgres-direct-connection-string>
```

### Local Development
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<any-secure-random-string>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
DATABASE_URL=<postgres-connection-string>
DIRECT_URL=<postgres-direct-connection-string>
```

## Google Cloud Console Checklist

Verify these settings in [Google Cloud Console](https://console.cloud.google.com/):

1. **OAuth 2.0 Client IDs**
   - ✅ Authorized redirect URIs includes:
     - `https://likethem.io/api/auth/callback/google` (production)
     - `http://localhost:3000/api/auth/callback/google` (development)
   - ✅ No trailing slashes
   - ✅ Correct protocol (https for production, http for localhost)

2. **OAuth Consent Screen**
   - ✅ App is configured
   - ✅ If in "Testing" mode, your email is added as a test user
   - ✅ Required scopes: `openid`, `email`, `profile`

3. **Credentials**
   - ✅ Client ID matches `GOOGLE_CLIENT_ID` env var
   - ✅ Client Secret matches `GOOGLE_CLIENT_SECRET` env var
   - ✅ Both from the same OAuth client

## Verification Steps

### 1. Local Verification
```bash
# 1. Set environment variables in .env.local
cp env.postgres.example .env.local
# Edit .env.local with your values

# 2. Generate NEXTAUTH_SECRET if needed
openssl rand -base64 32

# 3. Start dev server
npm run dev

# 4. Test sign-in
# Open http://localhost:3000/auth/signin
# Click "Continue with Google"
# Should redirect to Google → back to /account
```

### 2. Production Verification
1. **Set environment variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add/verify all required variables
   - Ensure `NEXTAUTH_URL=https://likethem.io` (no trailing slash)

2. **Deploy:**
   ```bash
   git push origin main  # Triggers Vercel deployment
   ```

3. **Test:**
   - Visit https://likethem.io/auth/signin
   - Click "Continue with Google"
   - Should complete sign-in flow

4. **Check Logs:**
   - Vercel Dashboard → Functions → View logs
   - Look for `[AUTH][GET]` and `[NextAuth]` log entries
   - Should see correlation IDs and success messages

### 3. Regression Checks
- ✅ Email/password sign-in works
- ✅ Sign out works
- ✅ New user can sign up with Google
- ✅ Existing user can sign in with Google
- ✅ Session persists across refreshes
- ✅ Protected routes require authentication
- ✅ Admin/curator role checks work

## Error Resolution

### If you still see "Callback" error:

1. **Check Vercel logs:**
   - Look for correlation IDs: `[AUTH][GET][req-...]`
   - Check for error messages with stack traces

2. **Verify environment variables:**
   - Use Vercel CLI: `vercel env ls`
   - Ensure `NEXTAUTH_SECRET` is set
   - Ensure `NEXTAUTH_URL` matches your domain exactly

3. **Check Google Cloud Console:**
   - Verify redirect URI matches exactly
   - Check OAuth consent screen status
   - Ensure your email is in test users (if app not published)

4. **Browser DevTools:**
   - Network tab → Look for `/api/auth/callback/google`
   - Check response status and body
   - Application tab → Cookies → Verify cookies are set

5. **Database:**
   - Verify migrations applied: `npx prisma migrate status`
   - Check `accounts` table exists
   - Test database connection

## Next Steps

1. **Generate and set `NEXTAUTH_SECRET` in production:**
   ```bash
   openssl rand -base64 32
   # Copy output and set in Vercel environment variables
   ```

2. **Verify Google Cloud Console redirect URI:**
   - Must be exactly: `https://likethem.io/api/auth/callback/google`

3. **Deploy and test:**
   - Push changes to trigger deployment
   - Test sign-in flow
   - Monitor logs for any errors

4. **Monitor:**
   - Watch Vercel function logs for first few sign-ins
   - Check for any new error patterns
   - Verify user accounts are created in database

## Additional Notes

- The duplicate `app/api/auth/[...nextauth]/auth.ts` file can be deleted (it's no longer used)
- All auth imports now point to `@/lib/auth`
- Cookie configuration is now explicit and production-ready
- Error logging includes correlation IDs for easier debugging

## Support

If issues persist after following this guide:
1. Check `docs/OAUTH_TROUBLESHOOTING.md` for detailed troubleshooting
2. Review Vercel function logs with correlation IDs
3. Verify all environment variables are set correctly
4. Confirm Google Cloud Console configuration matches exactly
