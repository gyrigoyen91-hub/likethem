"use client";

import { signIn, getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const callbackUrl = searchParams?.callbackUrl ?? "/account";

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token || null));
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

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