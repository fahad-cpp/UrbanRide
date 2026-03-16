import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { formatPhoneInput, validatePhone } from '../utils/phoneUtils'
import '../styles/profile-page.css'

function ProfilePage({ onNavigate }) {
  const { user, updateUser, deleteAccount, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({ name: '', phone: '' })

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' })
    }
  }, [user, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneInput(value) }))
      setFieldErrors(prev => ({ ...prev, phone: '' }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Name cannot be empty.'
    }
    if (formData.phone.trim()) {
      const phoneError = validatePhone(formData.phone)
      if (phoneError) errors.phone = phoneError
    }
    return errors
  }

  const handleSave = async () => {
    setErrorMessage('')
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      setLoading(true)
      await updateUser({ name: formData.name.trim(), phone: formData.phone.trim() })
      setIsEditing(false)
      setFieldErrors({})
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrorMessage('')
    setFieldErrors({})
    setFormData({ name: user?.name || '', phone: user?.phone || '' })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    try {
      setDeleteLoading(true)
      setDeleteError('')
      await deleteAccount()
      onNavigate('home')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.')
      setDeleteLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : ''

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="profile-container">
        <div className="profile-grid">

          {/* ── Sidebar ── */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-container">
                <div className="avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <div className="role-badge">{user?.role}</div>
              {memberSince && (
                <p className="member-since">Member since {memberSince}</p>
              )}
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>

          {/* ── Main ── */}
          <div className="profile-main">

            {/* Account Info / Edit Form */}
            <div className="profile-info-card">
              {!isEditing ? (
                <>
                  <div className="profile-info-header">
                    <h2 className="profile-info-title">Account Information</h2>
                    <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                      Edit Profile
                    </button>
                  </div>
                  <div className="profile-fields">
                    <div className="info-field">
                      <span className="field-label">Full Name</span>
                      <span className="field-value">{user?.name}</span>
                    </div>
                    <div className="info-field">
                      <span className="field-label">Email Address</span>
                      <span className="field-value">{user?.email}</span>
                    </div>
                    <div className="info-field">
                      <span className="field-label">Phone Number</span>
                      <span className="field-value">{user?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-info-header">
                    <h2 className="profile-info-title">Edit Profile</h2>
                  </div>

                  {errorMessage && (
                    <div className="profile-error">
                      <span className="profile-error-icon">!</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="edit-form">
                    <div className="form-field">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-input${fieldErrors.name ? ' form-input-invalid' : ''}`}
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                      {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        value={user?.email}
                        className="form-input form-input-disabled"
                        disabled
                        title="Email cannot be changed"
                      />
                      <span className="field-hint">Email address cannot be changed</span>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-input${fieldErrors.phone ? ' form-input-invalid' : ''}`}
                        placeholder="98765 43210"
                        disabled={loading}
                        maxLength={16}
                      />
                      {fieldErrors.phone
                        ? <span className="field-error">{fieldErrors.phone}</span>
                        : <span className="field-hint">India: 98765 43210 · With code: +91 98765 43210</span>
                      }
                    </div>

                    <div className="form-buttons">
                      <button onClick={handleSave} disabled={loading} className="btn-save-changes">
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={handleCancel} disabled={loading} className="btn-cancel-edit">
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Danger Zone ── */}
            <div className="danger-zone-card">
              <div className="danger-zone-header">
                <h2 className="danger-zone-title">Danger Zone</h2>
              </div>
              <div className="danger-zone-body">
                <div className="danger-zone-info">
                  <p className="danger-zone-desc">
                    Permanently delete your account and all associated data. This action
                    <strong> cannot be undone</strong>.
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
                    className="btn-delete-account"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="delete-confirm-panel">
                    <p className="delete-confirm-instructions">
                      Type <strong>DELETE</strong> to confirm you want to permanently delete your account:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="delete-confirm-input"
                      disabled={deleteLoading}
                    />
                    {deleteError && (
                      <div className="profile-error" style={{ marginTop: '8px' }}>
                        <span className="profile-error-icon">!</span>
                        <span>{deleteError}</span>
                      </div>
                    )}
                    <div className="delete-confirm-buttons">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                        className="btn-confirm-delete"
                      >
                        {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                      </button>
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError('') }}
                        disabled={deleteLoading}
                        className="btn-cancel-delete"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage