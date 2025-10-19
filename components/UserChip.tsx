"use client";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut } from "lucide-react";

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
        className="text-sm text-gray-700 hover:text-black hover:underline underline-offset-4 transition-colors"
      >
        Sign In
      </button>
    );
  }

  const fullName = (user.name ?? "").trim();
  const initial = fullName ? fullName[0].toUpperCase() : (user.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="flex items-center gap-2 max-w-[180px]">
      <Link href="/account" className="flex items-center gap-2 group">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm">
          {user.image ? (
            <Image src={user.image} alt={fullName || "User"} width={32} height={32} className="object-cover" />
          ) : (
            <UserCircle className="size-5 text-gray-700 group-hover:text-black transition-colors" strokeWidth={1.5} />
          )}
        </div>
        <span className="truncate text-sm text-gray-800 group-hover:text-black transition-colors">{fullName}</span>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="size-4 text-gray-600 hover:text-black transition-colors" strokeWidth={1.5} />
      </button>
    </div>
  );
}
