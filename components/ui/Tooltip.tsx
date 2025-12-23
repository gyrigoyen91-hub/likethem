'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ content, children, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      let top = 0
      let left = 0

      switch (position) {
        case 'top':
          top = rect.top + scrollY - 8
          left = rect.left + scrollX + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + scrollY + 8
          left = rect.left + scrollX + rect.width / 2
          break
        case 'left':
          top = rect.top + scrollY + rect.height / 2
          left = rect.left + scrollX - 8
          break
        case 'right':
          top = rect.top + scrollY + rect.height / 2
          left = rect.right + scrollX + 8
          break
      }

      setTooltipPosition({ top, left })
    }
  }, [isVisible, position])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  }

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: position === 'left' || position === 'right' 
          ? `translate(0, -50%)` 
          : 'translate(-50%, 0)',
      }}
      role="tooltip"
    >
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl max-w-xs whitespace-normal">
        {content}
      </div>
      <div
        className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
      />
    </div>
  )

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
      >
        {children}
      </span>
      {typeof window !== 'undefined' && isVisible && createPortal(tooltipContent, document.body)}
    </>
  )
}
