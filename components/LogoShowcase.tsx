'use client'

import Logo from './Logo'
import Favicon from './Favicon'

export default function LogoShowcase() {
  return (
    <div className="py-24 bg-white">
      <div className="container-custom">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-16 text-center">
          Logo Design Showcase
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Navbar Context */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">In Navbar</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between">
                <Logo size="md" />
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>Dress Like Them</span>
                  <span>Sell Like Them</span>
                  <span>Sign In</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Context */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">Mobile Header</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-sm">
              <div className="flex items-center justify-between">
                <Logo size="sm" />
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Centered on Homepage */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">Centered on Homepage</h3>
            <div className="border border-gray-200 rounded-lg p-12 bg-white text-center">
              <Logo size="xl" className="mb-4" />
              <p className="text-gray-600">Hero section placement</p>
            </div>
          </div>

          {/* Packaging/Tags */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">Packaging & Tags</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center space-x-4">
                <Favicon size={24} />
                <Logo size="sm" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Product tags and packaging</p>
            </div>
          </div>

          {/* Favicon Variations */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">Favicon Variations</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center space-x-4">
                <Favicon size={16} />
                <Favicon size={32} />
                <Favicon size={48} />
              </div>
              <p className="text-xs text-gray-500 mt-2">16px, 32px, 48px sizes</p>
            </div>
          </div>

          {/* Inverted on Dark Background */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-light">Inverted on Dark</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-carbon">
              <Logo size="lg" variant="inverted" />
              <p className="text-white/60 text-xs mt-2">Footer and dark contexts</p>
            </div>
          </div>
        </div>

        {/* Logo Specifications */}
        <div className="mt-16 p-8 bg-gray-50 rounded-lg">
          <h3 className="font-serif text-2xl font-light mb-6">Logo Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-3">Typography</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Font: Canela (primary), Playfair Display (fallback)</li>
                <li>• Weight: Medium (500)</li>
                <li>• Case: All uppercase</li>
                <li>• Letter-spacing: 0.25em (generous)</li>
                <li>• Color: Pure black (#000000) on white</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Layout & Sizing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Layout: Horizontal single-line</li>
                <li>• Minimum size: 48px height</li>
                <li>• Scalable vector format</li>
                <li>• Clear space: 1x letter height</li>
                <li>• Invertible for dark backgrounds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 