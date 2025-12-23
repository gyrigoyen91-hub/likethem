# Google OAuth Sign-In Troubleshooting Guide

## Quick Checklist

Before diving into detailed troubleshooting, verify these common issues:

### 1. Environment Variables (CRITICAL)

Ensure all required environment variables are set in both local and production:

```bash
# Required for NextAuth
NEXTAUTH_URL=https://likethem.io  # Production: https://likethem.io | Local: http://localhost:3000
NEXTAUTH_SECRET=<generate-a-secure-random-string>  # REQUIRED - generate with: openssl rand -base64 32

# Required for Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Validation:**
- ✅ `NEXTAUTH_SECRET` is set and not empty
- ✅ `NEXTAUTH_URL` matches your domain exactly (no trailing slash)
- ✅ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are from the same Google Cloud project
- ✅ No extra quotes or whitespace around values
- ✅ Production uses `https://` not `http://`

### 2. Google Cloud Console Configuration

**Authorized Redirect URIs** must EXACTLY match:

```
https://likethem.io/api/auth/callback/google
```

For local development:
```
http://localhost:3000/api/auth/callback/google
```

**Checklist:**
- ✅ Redirect URI matches exactly (no trailing slash, correct protocol)
- ✅ OAuth Consent Screen is configured
- ✅ App is in "Testing" mode with your email added as a test user (if not published)
- ✅ Required scopes are enabled: `openid`, `email`, `profile`
- ✅ Client ID and Secret match the environment variables

### 3. Cookie Configuration

The app now uses explicit cookie configuration:
- **SameSite**: `lax` (required for OAuth redirects)
- **Secure**: `true` in production (HTTPS), `false` in localhost
- **HttpOnly**: `true` (security)

If cookies aren't being set:
- Check browser DevTools → Application → Cookies
- Verify domain matches your site
- Check for browser extensions blocking cookies
- Try incognito/private mode

### 4. Database Schema

Ensure NextAuth tables exist and migrations are applied:

```bash
npx prisma migrate deploy  # Production
npx prisma migrate dev     # Local development
```

Required tables:
- ✅ `users`
- ✅ `accounts` (for OAuth provider linking)
- ✅ `sessions`
- ✅ `verification_tokens`

### 5. Network & Deployment

**Vercel/Production:**
- ✅ Environment variables are set in Vercel dashboard
- ✅ Build completes successfully
- ✅ Runtime is Node.js (not Edge)
- ✅ No timeouts on `/api/auth/callback/google` route

**Local:**
- ✅ Running on correct port (3000)
- ✅ No firewall blocking OAuth redirects
- ✅ `NEXTAUTH_URL=http://localhost:3000` in `.env.local`

## Error Codes Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `Callback` | OAuth callback failed | Check server logs, verify redirect URI, check env vars |
| `Configuration` | Missing/invalid config | Verify `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `OAuthAccountNotLinked` | Email exists with different provider | Use the original sign-in method or enable account linking |
| `AccessDenied` | User denied OAuth consent | User must approve in Google consent screen |
| `OAuthSignin` | Error initiating OAuth | Check Google Cloud Console config |
| `OAuthCreateAccount` | Error creating user account | Check database connection, Prisma schema |

## Debugging Steps

### 1. Check Server Logs

Look for correlation IDs in logs:
```
[AUTH][GET][req-1234567890-abc123]
[NextAuth][signIn][signin-1234567890-xyz789]
```

### 2. Check Browser Network Tab

1. Open DevTools → Network
2. Attempt Google sign-in
3. Look for `/api/auth/callback/google?code=...` request
4. Check response status and body

### 3. Verify Callback URL

The callback URL should be:
```
https://likethem.io/api/auth/callback/google?code=<auth-code>&scope=...
```

If you see `?error=...` in the URL, that's the error code to investigate.

### 4. Test Environment Variables

Create a test endpoint (temporary) to verify env vars are loaded:

```typescript
// app/api/test-env/route.ts (DELETE AFTER TESTING)
export async function GET() {
  return Response.json({
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    // Don't expose secrets in production!
  });
}
```

## Common Root Causes

1. **Missing NEXTAUTH_SECRET** (Most Common)
   - NextAuth requires this for JWT signing and state encryption
   - Generate: `openssl rand -base64 32`
   - Set in Vercel environment variables

2. **Redirect URI Mismatch**
   - Must match EXACTLY in Google Cloud Console
   - Check for trailing slashes, http vs https, www vs non-www

3. **Cookie Issues**
   - SameSite=Strict breaks OAuth (now fixed to Lax)
   - Secure cookies on http://localhost (now fixed)
   - Domain mismatch

4. **Database Connection**
   - PrismaAdapter needs working DB connection
   - Check `DATABASE_URL` and `DIRECT_URL`
   - Verify migrations applied

5. **Multiple PrismaClient Instances**
   - Now fixed: using shared `@/lib/prisma` instance
   - Prevents connection pool exhaustion

## Verification Steps

After applying fixes:

1. **Local Test:**
   ```bash
   # Set env vars in .env.local
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<your-secret>
   GOOGLE_CLIENT_ID=<your-id>
   GOOGLE_CLIENT_SECRET=<your-secret>
   
   # Run dev server
   npm run dev
   
   # Test sign-in
   # Open http://localhost:3000/auth/signin
   # Click "Continue with Google"
   # Should redirect to Google, then back to /account
   ```

2. **Production Test:**
   - Verify all env vars in Vercel dashboard
   - Deploy latest code
   - Test sign-in flow
   - Check Vercel function logs for errors

3. **Regression Checks:**
   - ✅ Email/password sign-in still works
   - ✅ Sign out works
   - ✅ New user can sign up with Google
   - ✅ Existing user can sign in with Google
   - ✅ Session persists across page refreshes

## Getting Help

If issues persist:

1. Check server logs for correlation IDs
2. Capture browser Network tab screenshot
3. Note the exact error code from URL (`?error=...`)
4. Verify environment variables (without exposing secrets)
5. Check Google Cloud Console redirect URI configuration
