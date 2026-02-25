import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut } from 'lucide-react'
import LoginModal from './modals/LoginModal'
import SignupModal from './modals/SignupModal'

function Navigation({ onNavigate }) {
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <nav style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px' }}>
          
          <button onClick={() => onNavigate('home')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0d0d', fontWeight: 'bold', fontSize: '14px' }}>
              U
            </div>
            {!isMobile && (
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                UrbanRide
              </span>
            )}
          </button>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px' }}>
              <button onClick={() => onNavigate('home')} style={navBtn}>Home</button>

              {isLoggedIn && (
                <>
                  <button onClick={() => onNavigate('search')} style={navBtn}>Search</button>
                  <button onClick={() => onNavigate('bookings')} style={navBtn}>Bookings</button>
                  {user?.role === 'admin' && (
                    <button onClick={() => onNavigate('admin')} style={navBtn}>Admin</button>
                  )}
                </>
              )}
            </div>
          )}

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isLoggedIn ? (
                <>
                  <button onClick={() => onNavigate('profile')} style={navBtn}>
                    {user?.name}
                  </button>
                  <button onClick={logout} style={{ backgroundColor: 'var(--secondary)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setLoginOpen(true)} className="secondary">Login</button>
                  <button onClick={() => setSignupOpen(true)} className="primary">Sign Up</button>
                </>
              )}
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'var(--secondary)', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {mobileMenuOpen && isMobile && (
          <div style={{ borderTop: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <button onClick={() => { onNavigate('home'); setMobileMenuOpen(false) }} style={mobileBtn}>Home</button>

            {isLoggedIn && (
              <>
                <button onClick={() => { onNavigate('search'); setMobileMenuOpen(false) }} style={mobileBtn}>Search</button>
                <button onClick={() => { onNavigate('bookings'); setMobileMenuOpen(false) }} style={mobileBtn}>Bookings</button>
                <button onClick={() => { onNavigate('profile'); setMobileMenuOpen(false) }} style={mobileBtn}>Profile</button>

                {user?.role === 'admin' && (
                  <button onClick={() => { onNavigate('admin'); setMobileMenuOpen(false) }} style={mobileBtn}>Admin</button>
                )}

                <button onClick={logout} style={{ ...mobileBtn, backgroundColor: 'var(--secondary)' }}>
                  Logout
                </button>
              </>
            )}

            {!isLoggedIn && (
              <div style={{ display: 'flex', gap: '8px', padding: '0 16px', paddingTop: '8px' }}>
                <button onClick={() => { setLoginOpen(true); setMobileMenuOpen(false) }} className="secondary" style={{ flex: 1 }}>
                  Login
                </button>
                <button onClick={() => { setSignupOpen(true); setMobileMenuOpen(false) }} className="primary" style={{ flex: 1 }}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </>
  )
}

const navBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-light)',
  cursor: 'pointer'
}

const mobileBtn = {
  display: 'block',
  width: '100%',
  padding: '12px 16px',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  color: 'var(--text-light)',
  cursor: 'pointer'
}

export default Navigation