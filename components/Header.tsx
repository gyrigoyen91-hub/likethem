import Link from "next/link";
import Logo from "@/components/Logo";
import UserChip from "@/components/UserChip";
import HeaderSearchBar from "@/components/HeaderSearchBar";
import CartButton from "@/components/CartButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left: Logo */}
        <div className="justify-self-start">
          <Logo />
        </div>

        {/* Center: Nav */}
        <nav className="justify-self-center">
          <ul className="flex items-center gap-10 text-sm">
            <li>
              <Link
                href="/explore"
                className="text-gray-700 hover:text-black hover:underline underline-offset-4 transition-colors"
              >
                Dress Like Them
              </Link>
            </li>
            <li>
              <Link
                href="/sell"
                className="text-gray-700 hover:text-black hover:underline underline-offset-4 transition-colors"
              >
                Sell Like Them
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Search, Cart, Account */}
        <div className="justify-self-end flex items-center gap-4">
          <HeaderSearchBar />
          <CartButton />
          <UserChip user={user ?? null} />
        </div>
      </div>
    </header>
  );
} 