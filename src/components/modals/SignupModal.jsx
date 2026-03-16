import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { X } from 'lucide-react'
import { formatPhoneInput, validatePhone } from '../../utils/phoneUtils'
import '../../styles/modals.css'

function SignupModal({ isOpen, onClose }) {
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      const formatted = formatPhoneInput(value)
      setFormData(prev => ({ ...prev, phone: formatted }))
      // Clear phone error as user types
      setFieldErrors(prev => ({ ...prev, phone: '' }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.'
    }

    if (!formData.password) {
      errors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.'
    } else {
      const phoneError = validatePhone(formData.phone)
      if (phoneError) errors.phone = phoneError
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.phone.trim()
      )
      onClose()
      setFormData({ name: '', email: '', password: '', phone: '' })
      setFieldErrors({})
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', phone: '' })
    setFieldErrors({})
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content modal-large">

        <div className="modal-header">
          <h2 className="modal-title">Create Account</h2>
          <button onClick={handleClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>

          {error && (
            <div className="modal-error">
              <span className="error-icon">Error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="signup-name" className="form-label">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`modal-input${fieldErrors.name ? ' modal-input-error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="signup-email" className="form-label">Email Address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`modal-input${fieldErrors.email ? ' modal-input-error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="signup-password" className="form-label">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`modal-input${fieldErrors.password ? ' modal-input-error' : ''}`}
              disabled={loading}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="signup-phone" className="form-label">Phone Number</label>
            <input
              id="signup-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="98765 43210"
              className={`modal-input${fieldErrors.phone ? ' modal-input-error' : ''}`}
              disabled={loading}
              maxLength={16}
            />
            {fieldErrors.phone
              ? <span className="field-error">{fieldErrors.phone}</span>
              : <span className="field-hint">India: 98765 43210 · With code: +91 98765 43210</span>
            }
          </div>

          <button type="submit" disabled={loading} className="modal-btn-primary">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default SignupModal