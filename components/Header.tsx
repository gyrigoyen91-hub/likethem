'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import CartButton from '@/components/CartButton';
import UserChip from '@/components/UserChip';
import { useSession } from 'next-auth/react';
import { useT } from '@/hooks/useT';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const t = useT();

  const NAV = [
    { href: '/explore', label: t('nav.dress') },
    { href: '/apply', label: t('nav.sell') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'border-b border-black/5',
        'bg-white/70 backdrop-blur-md'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-serif text-xl tracking-wide">
              LIKETHEM
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative inline-flex items-center text-sm text-neutral-700 transition-colors hover:text-black',
                    active && 'text-black font-medium'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {/* Underline */}
                  <span
                    className={cn(
                      'pointer-events-none absolute -bottom-1 left-0 h-[1px] w-full origin-left bg-neutral-900/90',
                      'opacity-0 scale-x-0 transition-all duration-300 ease-out',
                      'group-hover:opacity-100 group-hover:scale-x-100 group-focus-visible:opacity-100 group-focus-visible:scale-x-100',
                      'motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-x-100',
                      active && 'opacity-100 scale-x-100'
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Favorites Button */}
            <Link
              href="/favorites"
              aria-label={t('nav.favorites')}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-all duration-200"
            >
              <Heart
                className={cn(
                  'w-[18px] h-[18px] text-neutral-700 transition-colors duration-200',
                  pathname === '/favorites' && 'text-black fill-black'
                )}
                strokeWidth={1.5}
              />
            </Link>

            <CartButton />
            <UserChip user={user ?? null} />
          </div>
        </div>
      </div>
    </header>
  );
} 