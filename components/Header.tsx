'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { User, ChevronDown, LogOut, Heart, ShoppingBag, Settings } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import CartIcon from './CartIcon'
import MiniCart from './MiniCart'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const { data: session, status } = useSession()
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { items, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setShowAccountDropdown(false)
  }

  const handleSearch = (query: string) => {
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleCartClick = () => {
    setShowMiniCart(!showMiniCart)
    setShowAccountDropdown(false) // Close account dropdown if open
  }

  const handleCartClose = () => {
    setShowMiniCart(false)
  }

  // Determine active navigation
  const isExploreActive = pathname === '/explore'
  const isSellActive = pathname === '/sell'

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-all duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="md" />

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/explore" 
                className={`nav-link transition-colors duration-200 font-medium ${
                  isExploreActive 
                    ? 'text-black border-b-2 border-black pb-1' 
                    : 'text-carbon hover:text-black'
                }`}
              >
                Dress Like Them
              </Link>
              <Link 
                href="/sell" 
                className={`nav-link transition-colors duration-200 font-medium ${
                  isSellActive 
                    ? 'text-black border-b-2 border-black pb-1' 
                    : 'text-carbon hover:text-black'
                }`}
              >
                Sell Like Them
              </Link>
            </nav>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <SearchBar onSearch={handleSearch} />
              
              {/* Cart Icon */}
              <CartIcon onClick={handleCartClick} />
              
              {/* User Icon / Sign In */}
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              ) : session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    className="flex items-center space-x-2 text-carbon hover:text-black transition-colors duration-200"
                  >
                    {session.user.avatar ? (
                      <img 
                        src={session.user.avatar} 
                        alt={session.user.fullName || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-medium hidden sm:inline">
                      {session.user.fullName || 'Account'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Account Dropdown */}
                  {showAccountDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                      <Link 
                        href="/account" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        My Account
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                      <Link 
                        href="/favorites" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        My Favorites
                      </Link>
                      {session.user.role === 'CURATOR' && (
                        <Link 
                          href="/dashboard/curator" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Curator Dashboard
                        </Link>
                      )}
                      {session.user.role !== 'CURATOR' && (
                        <Link 
                          href="/sell" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowAccountDropdown(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Become a Curator
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-2 text-carbon hover:text-black transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mini Cart */}
      <MiniCart 
        isOpen={showMiniCart}
        items={items} 
        onRemoveItem={removeItem} 
        onUpdateQuantity={updateQuantity}
        onClose={handleCartClose}
      />
    </>
  )
} 