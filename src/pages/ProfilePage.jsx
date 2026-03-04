import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/profile-page.css'

function ProfilePage({ onNavigate }) {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const updatedUser = await res.json()

      updateUser(updatedUser)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
          <span className="alert-icon">Success</span>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="profile-container">
        <div className="profile-grid">
          
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-container">
                <div className="avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              
              <div className="role-badge">
                {user?.role}
              </div>
              
              <p className="member-since">
                Member since {memberSince}
              </p>

              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-info-card">
              {!isEditing ? (
                <>
                  <div className="profile-info-header">
                    <h2 className="profile-info-title">Account Information</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-edit-profile"
                    >
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
                      <span className="field-value">
                        {user?.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-info-header">
                    <h2 className="profile-info-title">Edit Profile</h2>
                  </div>

                  <div className="edit-form">
                    <div className="form-field">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-buttons">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn-save-changes"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || ''
                          })
                        }}
                        className="btn-cancel-edit"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage