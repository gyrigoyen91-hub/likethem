"use client";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";

type User = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
};

export default function UserChip({ user }: { user: User | null }) {
  if (!user) {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="text-sm text-gray-700 hover:text-black hover:underline underline-offset-4"
      >
        Sign In
      </button>
    );
  }

  const fullName = (user.name ?? "").trim();
  const initial = fullName ? fullName[0].toUpperCase() : (user.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="flex items-center gap-2 max-w-[260px]">
      <Link href="/account" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm">
          {user.image ? (
            <Image src={user.image} alt={fullName || "User"} width={32} height={32} />
          ) : (
            <span className="font-medium text-gray-700">{initial}</span>
          )}
        </div>
        <span className="truncate text-sm text-gray-800">{fullName}</span>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-gray-600 hover:text-black"
        aria-label="Sign out"
      >
        Sign Out
      </button>
    </div>
  );
}
