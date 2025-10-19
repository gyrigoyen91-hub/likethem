"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import UserChip from "@/components/UserChip";

const navLink =
  "px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-black hover:underline underline-offset-4";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="justify-self-start">
          <Logo />
        </div>

        {/* Center: Nav */}
        <nav
          className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-4"
          aria-label="Primary"
        >
          <Link href="/explore" className={navLink}>
            Dress Like Them
          </Link>
          <Link href="/sell" className={navLink}>
            Sell Like Them
          </Link>
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center justify-self-end gap-3">
          {status === "loading" ? null : user ? (
            <>
              <Link href="/account" className="flex items-center">
                <UserChip name={user.name ?? user.fullName} image={user.image ?? null} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 transition hover:text-black"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/account" })}
              className="text-sm font-medium text-gray-700 transition hover:text-black"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 