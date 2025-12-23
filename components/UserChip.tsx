"use client";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut, ChevronDown, BarChart3, ShoppingBag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { safeSrc } from "@/lib/img";
import { useT } from "@/hooks/useT";

type User = {
  name?: string | null;
  image?: string | null;
  email?: string | null;
  role?: string;
};

export default function UserChip({ user }: { user: User | null }) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/account" })}
        className="text-sm text-gray-700 hover:text-black hover:underline underline-offset-4 transition-colors"
      >
        {t('auth.signIn')}
      </button>
    );
  }

  const fullName = (user.name ?? "").trim();
  const initial = fullName ? fullName[0].toUpperCase() : (user.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 max-w-[180px] hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm">
          {user.image ? (
            <Image src={safeSrc(user.image)} alt={fullName || "User"} width={32} height={32} className="object-cover" />
          ) : (
            <UserCircle className="size-5 text-gray-700" strokeWidth={1.5} />
          )}
        </div>
        <span className="truncate text-sm text-gray-800">{fullName}</span>
        <ChevronDown className="size-4 text-gray-600" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t('user.account')}
          </Link>
          
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="size-4" strokeWidth={1.5} />
            {t('user.orders')}
          </Link>
          
          {user.role === "CURATOR" && (
            <Link
              href="/dashboard/curator"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="size-4" strokeWidth={1.5} />
              {t('user.curatorDashboard')}
            </Link>
          )}
          
          <hr className="my-1" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
