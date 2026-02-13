'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    licenseNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup({
        ...formData,
        password: formData.password,
        role: 'customer',
      })
      onClose()
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        licenseNumber: '',
      })
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-foreground">Sign Up</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Driver's License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="DL123456"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
