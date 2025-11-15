'use client'

interface FaviconProps {
  size?: number
  className?: string
}

export default function Favicon({ size = 32, className = '' }: FaviconProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center bg-black text-white rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <span 
        className="font-serif font-medium uppercase"
        style={{
          fontFamily: 'Canela, "Playfair Display", serif',
          fontSize: `${size * 0.5}px`,
          fontWeight: 500,
          letterSpacing: '0.1em'
        }}
      >
        L
      </span>
    </div>
  )
} 