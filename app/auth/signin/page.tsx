"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <button
        className="w-full rounded-md border px-4 py-2"
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
        Continue with Google
      </button>
    </main>
  );
}