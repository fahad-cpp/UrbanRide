'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoginModal from './modals/LoginModal'
import SignupModal from './modals/SignupModal'

export default function Navigation() {
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <span className="text-xl font-bold text-primary hidden sm:inline">UrbanRide</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-foreground hover:text-primary transition">
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/search" className="text-foreground hover:text-primary transition">
                    Search Cars
                  </Link>
                  <Link href="/bookings" className="text-foreground hover:text-primary transition">
                    My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="text-foreground hover:text-primary transition">
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-muted transition"
                  >
                    <User size={18} />
                    <span className="hidden lg:inline">{user?.name}</span>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => setLoginOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setSignupOpen(true)}
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-secondary hover:bg-muted transition"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <Link
                href="/"
                className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/search"
                    className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Cars
                  </Link>
                  <Link
                    href="/bookings"
                    className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <div className="px-4 py-2 flex flex-col gap-2 border-t border-border mt-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setLoginOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        setSignupOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      size="sm"
                      className="w-full"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </>
  )
}
