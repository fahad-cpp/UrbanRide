import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { X } from 'lucide-react'

function SignupModal({ isOpen, onClose }) {
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      )

      onClose()
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: ''
      })
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '28rem', width: '100%', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-light)' }}>Sign Up</h2>
          <button onClick={onClose} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {error && (
            <div style={{ padding: '8px', backgroundColor: '#3d0d0d', color: '#ff8080', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary"
            style={{ width: '100%', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignupModal