'use client'

import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, EyeOff, Users, Car, BookOpen, DollarSign } from 'lucide-react'
import AdminVehicleForm from '@/components/admin/AdminVehicleForm'

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth()
  const { vehicles, bookings } = useData()
  const [showForm, setShowForm] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'vehicles' | 'bookings'>('dashboard')
  const [editingVehicle, setEditingVehicle] = useState<any>(null)

  if (!isLoggedIn || !user || user.role !== 'admin') {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You must be an admin to access this page</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const totalRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length
  const totalBookings = bookings.length
  const totalVehicles = vehicles.length

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setSelectedTab('dashboard')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'dashboard'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSelectedTab('vehicles')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'vehicles'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Fleet Management
          </button>
          <button
            onClick={() => setSelectedTab('bookings')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              selectedTab === 'bookings'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl shadow-md p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Vehicles</p>
                    <p className="text-3xl font-bold text-foreground">{totalVehicles}</p>
                  </div>
                  <Car className="text-primary" size={40} />
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-md p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Bookings</p>
                    <p className="text-3xl font-bold text-foreground">{confirmedBookings}</p>
                  </div>
                  <BookOpen className="text-primary" size={40} />
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-md p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="text-green-600" size={40} />
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-md p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
                  </div>
                  <Users className="text-primary" size={40} />
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-card rounded-xl shadow-md p-6 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Booking ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Vehicle</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(-5).reverse().map((booking) => {
                      const vehicle = vehicles.find((v) => v.id === booking.vehicleId)
                      return (
                        <tr key={booking.id} className="border-b border-border hover:bg-secondary transition">
                          <td className="py-4 px-4 text-foreground font-mono text-sm">{booking.id.slice(0, 8)}...</td>
                          <td className="py-4 px-4 text-foreground">{vehicle?.name || 'Unknown'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-foreground font-semibold">${booking.totalPrice}</td>
                          <td className="py-4 px-4 text-muted-foreground text-sm">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {selectedTab === 'vehicles' && (
          <div>
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => {
                  setEditingVehicle(null)
                  setShowForm(!showForm)
                }}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                {showForm ? 'Cancel' : 'Add Vehicle'}
              </Button>
            </div>

            {showForm && (
              <AdminVehicleForm
                vehicle={editingVehicle}
                onClose={() => {
                  setShowForm(false)
                  setEditingVehicle(null)
                }}
              />
            )}

            {/* Vehicle List */}
            <div className="space-y-4">
              {vehicles.length === 0 ? (
                <div className="bg-card rounded-xl shadow-md p-12 text-center border border-border">
                  <Car className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No vehicles in fleet</p>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-card rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      {/* Vehicle Image */}
                      <div>
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>

                      {/* Vehicle Details */}
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-bold text-foreground mb-2">{vehicle.name}</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground">{vehicle.year}</span> Year
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">${vehicle.pricePerDay}</span> /day
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{vehicle.type}</span> Type
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{vehicle.seats}</span> Seats
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setShowForm(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {vehicle.available ? (
                            <>
                              <Eye size={16} />
                              Available
                            </>
                          ) : (
                            <>
                              <EyeOff size={16} />
                              Unavailable
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <div>
            <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Booking ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Vehicle</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Dates</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Payment</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const vehicle = vehicles.find((v) => v.id === booking.vehicleId)
                      const startDate = new Date(booking.startDate)
                      const endDate = new Date(booking.endDate)

                      return (
                        <tr key={booking.id} className="border-b border-border hover:bg-secondary transition">
                          <td className="py-4 px-6 text-foreground font-mono text-sm">{booking.id.slice(0, 8)}...</td>
                          <td className="py-4 px-6 text-foreground">{vehicle?.name || 'Unknown'}</td>
                          <td className="py-4 px-6 text-foreground text-sm">
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-foreground font-semibold">${booking.totalPrice}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
