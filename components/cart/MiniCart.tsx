"use client";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorId: string; // id of button for a11y
};

export default function MiniCart({ open, onClose, anchorId }: Props) {
  const { items, getSubtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  // Note: In App Router, we can't listen to route changes like in Pages Router
  // The modal will close when the user navigates away

  if (!open) return null;

  const subtotal = getSubtotal();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div
      role="dialog"
      aria-labelledby={anchorId}
      aria-modal="false"
      className="absolute right-0 mt-3 w-[380px] max-w-[90vw] rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-sm shadow-lg ring-1 ring-black/5"
    >
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium tracking-wide text-neutral-900">
            Your bag
          </h3>
          <span className="text-xs text-neutral-500">{itemCount} item{itemCount !== 1 && "s"}</span>
        </div>
      </div>

      <div className="max-h-[380px] overflow-auto">
        {items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-neutral-500">Your bag is empty.</p>
            <Link href="/explore" className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-black">
              Discover stores
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-neutral-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    priority={false}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-neutral-900 line-clamp-1">{item.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">by {item.curator}</p>
                      {(item.size || item.color) && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {[item.size, item.color].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-neutral-800">${(item.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-neutral-300">
                      <button
                        aria-label="Decrease quantity"
                        className="px-2 py-1 text-sm hover:bg-neutral-100"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="px-2 text-sm tabular-nums">{item.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        className="px-2 py-1 text-sm hover:bg-neutral-100"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-4"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-medium text-neutral-900">${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/cart"
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-center text-sm hover:border-neutral-800"
            onClick={onClose}
          >
            View cart
          </Link>
          <Link
            href="/checkout"
            className={`flex-1 rounded-xl px-3 py-2 text-center text-sm text-white
              ${items.length ? "bg-black hover:bg-neutral-900" : "bg-neutral-300 cursor-not-allowed"}`}
            aria-disabled={items.length === 0}
            onClick={onClose}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
