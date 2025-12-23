'use client';

import { cn } from '@/lib/utils';

type CTAButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button' | 'link';
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  className?: string;
};

export default function CTAButton({
  as = 'button',
  href,
  variant = 'primary',
  size = 'lg',
  className,
  children,
  ...props
}: CTAButtonProps) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-full select-none transition-all duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20';

  const sizes = {
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm md:text-[15px]',
  } as const;

  const variants = {
    // Soft, classy dark pill with slight translucency over imagery
    primary:
      'bg-neutral-900/90 text-white hover:bg-neutral-900 ' +
      'shadow-sm hover:shadow-md backdrop-blur-sm',

    // Light ghost pill with soft border; ideal for secondary action
    secondary:
      'bg-white/85 text-neutral-900 border border-black/10 ' +
      'hover:bg-white shadow-sm hover:shadow-md backdrop-blur-sm',
  } as const;

  const cls = cn(base, sizes[size], variants[variant], 'hover:-translate-y-[1px]', className);

  if (as === 'link' && href) {
    // use next/link lazily to avoid SSR issues
    const Link = require('next/link').default;
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
