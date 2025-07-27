'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'inverted'
  className?: string
}

export default function Logo({ size = 'md', variant = 'default', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg tracking-[0.15em]',
    md: 'text-2xl tracking-[0.2em]',
    lg: 'text-3xl tracking-[0.25em]',
    xl: 'text-4xl tracking-[0.3em]'
  }

  const variantClasses = {
    default: 'text-black',
    inverted: 'text-white'
  }

  return (
    <Link href="/" className={`inline-block ${className}`}>
      <span 
        className={`
          font-serif font-medium uppercase
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          transition-colors duration-200
        `}
        style={{
          fontFamily: 'Canela, "Playfair Display", serif',
          fontWeight: 500
        }}
      >
        LIKETHEM
      </span>
    </Link>
  )
} 