'use client'

import { useAuth } from '@/context/AuthContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoggedIn, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    licenseNumber: user?.licenseNumber || '',
  })

  if (!isLoggedIn || !user) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please login to view your profile</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      licenseNumber: user.licenseNumber,
    })
    setIsEditing(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-md p-8 text-center border border-border">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{user.name}</h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              <div className="px-3 py-1 bg-primary text-white rounded-full text-sm font-semibold inline-block mb-6 capitalize">
                {user.role}
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <Button
                onClick={() => {
                  logout()
                  window.location.href = '/'
                }}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-md p-8 space-y-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Driver's License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-border">
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Save size={18} />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl shadow-md p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Account ID</h3>
            <p className="text-muted-foreground text-sm font-mono">{user.id}</p>
          </div>
          <div className="bg-card rounded-xl shadow-md p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Account Type</h3>
            <p className="text-muted-foreground capitalize">{user.role}</p>
          </div>
          <div className="bg-card rounded-xl shadow-md p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Member Since</h3>
            <p className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
