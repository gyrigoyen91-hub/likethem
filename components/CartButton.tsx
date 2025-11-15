"use client";
import { useState, useRef, useEffect } from "react";
import MiniCart from "@/components/cart/MiniCart";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const anchorId = "header-cart-button";

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!btnRef.current) return;
      const pop = document.getElementById("mini-cart-popover");
      if (
        open &&
        !btnRef.current.contains(e.target as Node) &&
        pop &&
        !pop.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <button
        id={anchorId}
        ref={btnRef}
        aria-expanded={open}
        aria-controls="mini-cart-popover"
        onClick={() => setOpen(v => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 hover:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
      >
        <ShoppingBag className="size-5 text-gray-700 hover:text-black transition-colors" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-black text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        id="mini-cart-popover"
        className="absolute right-0 z-40"
        style={{ top: "calc(100% + 6px)" }}
      >
        <MiniCart open={open} onClose={() => setOpen(false)} anchorId={anchorId} />
      </div>
    </div>
  );
}
