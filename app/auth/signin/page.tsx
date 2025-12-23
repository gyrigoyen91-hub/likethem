"use client";

import { signIn, getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const error = searchParams?.error;
  const callbackUrl = searchParams?.callbackUrl ?? "/account";

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
            ? "This email is already associated with another account. Please log in using the original method."
            : error === "Callback" || error === "OAuthCallback" || error === "CallbackRouteError"
            ? "There was an error during Google sign-in (OAuth callback). This may be due to a configuration issue. Please try again or contact support if this persists."
            : error === "Configuration"
            ? "Authentication configuration error. Please contact support."
            : error === "AccessDenied"
            ? "Access denied. Please contact support."
            : error === "OAuthSignin"
            ? "Error initiating Google sign-in. Please try again."
            : error === "OAuthCreateAccount"
            ? "Error creating account. Please try again or contact support."
            : error === "EmailCreateAccount"
            ? "Error creating account with email. Please try again."
            : error === "CredentialsSignin"
            ? "Invalid email or password. Please try again."
            : `Sign-in error: ${error}. Please try again or contact support if this persists.`
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