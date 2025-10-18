"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        LIKETHEM
      </Link>

      <nav className="flex items-center gap-4">
        <Link href="/curators" className="hover:text-gray-700">
          Dress Like Them
        </Link>
        <Link href="/sell" className="hover:text-gray-700">
          Sell Like Them
        </Link>

        {status === "loading" ? null : user ? (
          <div className="flex items-center gap-2">
            <Link href="/account" className="flex items-center gap-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              )}
              <span className="text-sm font-medium">
                {(user.fullName ?? user.name ?? "").split(" ")[0]}
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-600 hover:text-black"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
} 