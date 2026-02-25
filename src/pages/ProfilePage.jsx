import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function ProfilePage({ onNavigate }) {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
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
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '32px' }}>Profile</h1>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 2fr', gap: '32px' }}>
          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '32px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ width: '96px', height: '96px', margin: '0 auto 24px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0d0d', fontSize: '36px', fontWeight: 'bold' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{user?.email}</p>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--primary)', color: '#0d0d0d', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
                {user?.role}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
              </p>
              <button onClick={handleLogout} className="secondary" style={{ width: '100%' }}>Logout</button>
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '32px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {!isEditing ? (
                <>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{user?.name}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{user?.email}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' }}>Phone</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{user?.phone || 'Not provided'}</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="primary" style={{ marginTop: '16px' }}>Edit Profile</button>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button onClick={handleSave} className="primary" style={{ flex: 1 }}>Save Changes</button>
                    <button onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || ''
                      })
                    }} className="secondary" style={{ flex: 1 }}>Cancel</button>
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