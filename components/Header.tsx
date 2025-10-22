import Link from "next/link";
import Logo from "@/components/Logo";
import UserChip from "@/components/UserChip";
import HeaderSearch from "@/components/search/HeaderSearch";
import CartButton from "@/components/CartButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/75 border-b border-gray-100">
      <div className="mx-auto max-w-7xl h-14 grid grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        <nav className="flex items-center gap-10 justify-center">
          <Link
            href="/explore"
            className="text-sm text-gray-800 hover:text-black hover:underline underline-offset-4 transition-colors"
          >
            Dress Like Them
          </Link>
          <Link
            href="/sell"
            className="text-sm text-gray-800 hover:text-black hover:underline underline-offset-4 transition-colors"
          >
            Sell Like Them
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-4">
          {/* Desktop search */}
          <div className="hidden md:block">
            <HeaderSearch />
          </div>

          <CartButton />
          <UserChip user={user ?? null} />
        </div>
      </div>
    </header>
  );
} 