'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-carbon text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size="lg" variant="inverted" className="mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              The exclusive platform where influencers curate their fashion stores. 
              Dress like the ones you admire.
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <button className="px-4 py-2 bg-white text-carbon hover:bg-gray-200 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/explore" className="hover:text-white transition-colors">Stores</Link></li>
              <li><Link href="/curators" className="hover:text-white transition-colors">Curators</Link></li>
              <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link href="/trending" className="hover:text-white transition-colors">Trending</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="/access" className="hover:text-white transition-colors">Request access</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 LikeThem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 