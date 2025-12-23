import { ReactNode } from 'react'

interface AdminPageShellProps {
  title: string
  subtitle?: string
  toolbar?: ReactNode
  children: ReactNode
}

export default function AdminPageShell({
  title,
  subtitle,
  toolbar,
  children,
}: AdminPageShellProps) {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Toolbar */}
        {toolbar && (
          <div className="mb-6">
            {toolbar}
          </div>
        )}

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}
