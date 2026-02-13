'use client'

import { useState } from 'react'
import { Vehicle } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useData } from '@/context/DataContext'

interface AdminVehicleFormProps {
  vehicle?: Vehicle | null
  onClose: () => void
}

export default function AdminVehicleForm({ vehicle, onClose }: AdminVehicleFormProps) {
  const { addBooking, bookings } = useData()
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    type: vehicle?.type || 'sedan',
    seats: vehicle?.seats || 5,
    transmission: vehicle?.transmission || 'automatic',
    fuelType: vehicle?.fuelType || 'petrol',
    mileage: vehicle?.mileage || 0,
    pricePerDay: vehicle?.pricePerDay || 50,
    image: vehicle?.image || '',
    available: vehicle?.available !== false,
    location: vehicle?.location || 'New York',
    features: vehicle?.features?.join(', ') || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.brand || !formData.model) {
        throw new Error('Please fill in all required fields')
      }

      // For now, vehicles are stored in the main data context
      // In a real app, this would call an API endpoint
      const features = formData.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f)

      console.log('Vehicle would be saved:', {
        ...formData,
        features,
      })

      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-md p-8 mb-8 border border-primary">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-secondary rounded-lg transition"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vehicle Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Toyota Corolla"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Toyota"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Corolla"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Chicago">Chicago</option>
                <option value="Miami">Miami</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mileage (km)
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Vehicle Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="economy">Economy</option>
                <option value="compact">Compact</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Seats
              </label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Transmission
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Availability */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Pricing & Availability</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price per Day ($)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Features</h4>
          <label className="block text-sm text-muted-foreground mb-2">
            Enter features separated by commas
          </label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="AC, Power Steering, ABS, Airbags"
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-foreground font-medium">Available for Booking</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
