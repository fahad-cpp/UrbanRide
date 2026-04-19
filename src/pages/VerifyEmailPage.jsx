import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, RefreshCw, LogOut } from 'lucide-react'

function VerifyEmailPage() {
  const { pendingEmail, cancelVerification } = useAuth()
  const [dots, setDots] = useState('.')

  // Animated ellipsis to show polling is active
  useEffect(() => {
    const t = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        maxWidth: '480px',
        width: '100%',
        padding: '48px 40px',
        textAlign: 'center',
        animation: 'slideInUp 0.3s ease-out',
      }}>

        {/* Icon */}
        <div style={{
          width: '80px', height: '80px',
          background: 'rgba(233, 69, 96, 0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Mail size={36} color="#e94560" />
        </div>

        <h1 style={{ color: 'var(--text-light)', fontSize: '24px', margin: '0 0 12px', fontWeight: '700' }}>
          Verify Your Email
        </h1>

        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 8px' }}>
          We've sent a verification link to:
        </p>
        <p style={{
          color: '#e94560', fontWeight: '600', fontSize: '15px',
          margin: '0 0 24px',
          background: 'rgba(233,69,96,0.1)',
          padding: '10px 16px',
          borderRadius: '8px',
          wordBreak: 'break-all',
        }}>
          {pendingEmail}
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 32px' }}>
          Click the link in the email to verify your account.
          This page will automatically log you in once verified.
        </p>

        {/* Polling indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '14px 20px',
          marginBottom: '28px',
        }}>
          <RefreshCw size={16} color="#e94560" style={{ animation: 'spin 2s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Waiting for verification{dots}
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          Didn't receive the email? Check your spam folder or&nbsp;
          <span style={{ color: '#e94560' }}>wait a few minutes</span> and try again.
        </p>

        <button
          onClick={cancelVerification}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '12px',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#e94560'
            e.currentTarget.style.color = '#e94560'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-light)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <LogOut size={15} />
          Back to sign in
        </button>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VerifyEmailPage
