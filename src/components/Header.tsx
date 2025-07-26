import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut, Settings, Cake } from 'lucide-react'
import { Button } from './ui/button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { getItemCount } = useCart()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Cake className="h-8 w-8 text-bakery-gold" />
            <span className="font-display text-2xl font-bold text-bakery-brown">
              Delicious Bakers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side - Cart, User Menu, Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <Link to="/cart" className="relative">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              {user ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Button asChild variant="ghost">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen 
            ? "max-h-64 opacity-100 pb-4" 
            : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <nav className="flex flex-col space-y-4 pt-4 border-t border-bakery-cream">
            <Link
              to="/"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-bakery-brown hover:text-bakery-gold transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
