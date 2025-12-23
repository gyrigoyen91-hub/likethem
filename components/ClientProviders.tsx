"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { getLocaleFromCookie } from "@/lib/i18n/getLocale";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Read locale from cookie on initial render (client-side only)
  const initialLocale = typeof window !== 'undefined' ? getLocaleFromCookie() : 'es'

  return (
    <SessionProvider>
      <I18nProvider initialLocale={initialLocale}>
        <CartProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </CartProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
