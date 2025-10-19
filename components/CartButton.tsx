"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartButton() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
      prefetch={false}
    >
      <span aria-hidden>🛒</span>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
