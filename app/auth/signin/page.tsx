"use client";

import { signIn, getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/account";

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token || null));
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error === "OAuthAccountNotLinked" 
            ? "That email is already in use with a different sign-in method. Please sign in using that method or contact support."
            : error === "CallbackRouteError"
            ? "There was an error processing your sign-in. Please try again."
            : error === "Configuration"
            ? "Authentication configuration error. Please contact support."
            : error === "AccessDenied"
            ? "Access denied. Please contact support."
            : `Error: ${error}`
          }
        </div>
      )}

      {/* Google */}
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        Continue with Google
      </button>

      {/* Divider */}
      <div className="my-6 text-center text-sm text-gray-500">or</div>

      {/* Credentials (only works if CredentialsProvider is enabled) */}
      <form method="post" action="/api/auth/callback/credentials" className="space-y-3">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken ?? undefined} />
        <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />
        <input 
          name="email" 
          type="email" 
          required 
          placeholder="Email" 
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <input 
          name="password" 
          type="password" 
          required 
          placeholder="Password" 
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <button 
          type="submit" 
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-90 transition-opacity"
        >
          Continue with email
        </button>
      </form>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-12">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}