import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react'
import LoginModal from './modals/LoginModal'
import SignupModal from './modals/SignupModal'
import '../styles/navigation.css'

function Navigation({ onNavigate }) {
  const { isLoggedIn, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    let t; const handleResize = () => { clearTimeout(t); t = setTimeout(() => setIsMobile(window.innerWidth < 768), 150) }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          
          <button
            onClick={() => onNavigate('home')}
            className="nav-logo"
          >
            <div className="logo-icon">U</div>
            {!isMobile && (
              <span className="logo-text">UrbanRide</span>
            )}
          </button>

          {!isMobile && (
            <div className="nav-menu-desktop">
              {isLoggedIn && user?.role === 'admin' ? (
                <button onClick={() => onNavigate('admin')} className="nav-link admin-link">
                  Admin Panel
                </button>
              ) : (
                <>
                  <button onClick={() => onNavigate('home')} className="nav-link">
                    Home
                  </button>

                  {isLoggedIn && (
                    <>
                      <button onClick={() => onNavigate('search')} className="nav-link">
                        Search
                      </button>
                      <button onClick={() => onNavigate('bookings')} className="nav-link">
                        Bookings
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {!isMobile && (
            <div className="nav-auth-section">
              <button
                onClick={toggleTheme}
                className="nav-theme-toggle"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {isLoggedIn ? (
                <>
                  {user?.role !== 'admin' && (
                    <button
                      onClick={() => onNavigate('profile')}
                      className="nav-profile"
                    >
                      <span className="profile-icon">U</span>
                      <span className="profile-name">{user?.name}</span>
                    </button>
                  )}
                  <button onClick={logout} className="nav-logout">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setLoginOpen(true)} className="nav-btn-login">
                    Login
                  </button>
                  <button onClick={() => setSignupOpen(true)} className="nav-btn-signup">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}

          {isMobile && (
            <div className="nav-mobile-right">
              <button
                onClick={toggleTheme}
                className="nav-theme-toggle"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="nav-toggle"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>

        {mobileMenuOpen && isMobile && (
          <div className="mobile-menu">
            {isLoggedIn && user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('admin')
                    setMobileMenuOpen(false)
                  }}
                  className="mobile-menu-link admin-link"
                >
                  Admin Panel
                </button>
                <button
                  onClick={logout}
                  className="mobile-menu-link logout-link"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('home')
                    setMobileMenuOpen(false)
                  }}
                  className="mobile-menu-link"
                >
                  Home
                </button>

                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('search')
                        setMobileMenuOpen(false)
                      }}
                      className="mobile-menu-link"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('bookings')
                        setMobileMenuOpen(false)
                      }}
                      className="mobile-menu-link"
                    >
                      Bookings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('profile')
                        setMobileMenuOpen(false)
                      }}
                      className="mobile-menu-link"
                    >
                      Profile
                    </button>
                    <button
                      onClick={logout}
                      className="mobile-menu-link logout-link"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                )}

                {!isLoggedIn && (
                  <div className="mobile-auth-buttons">
                    <button
                      onClick={() => {
                        setLoginOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="mobile-btn-login"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setSignupOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="mobile-btn-signup"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </>
  )
}

export default Navigation