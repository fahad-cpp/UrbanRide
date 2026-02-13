'use client'

import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function BookingsPage() {
  const { user, isLoggedIn } = useAuth()
  const { bookings, vehicles, cancelBooking } = useData()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please login to view your bookings</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const userBookings = bookings.filter((b) => b.userId === user!.id)

  const getVehicle = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId)
  }

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(bookingId)
      setCancellingId(null)
    }
  }

  const canCancel = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilStart > 24
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Bookings</h1>

        {userBookings.length === 0 ? (
          <div className="bg-card rounded-xl shadow-md p-12 text-center border border-border">
            <AlertCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start your journey by searching and booking a car
            </p>
            <Link href="/search">
              <Button>Search Cars</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userBookings.map((booking) => {
              const vehicle = getVehicle(booking.vehicleId)
              if (!vehicle) return null

              const startDate = new Date(booking.startDate)
              const endDate = new Date(booking.endDate)
              const isPast = endDate < new Date()

              return (
                <div
                  key={booking.id}
                  className="bg-card rounded-xl shadow-md overflow-hidden border border-border hover:shadow-lg transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Vehicle Image */}
                    <div className="md:col-span-1">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{vehicle.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          Booking ID: {booking.id}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pick-up</p>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar size={16} />
                            {startDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Drop-off</p>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar size={16} />
                            {endDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold text-foreground">{booking.totalDays} day(s)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <MapPin size={16} />
                            {booking.pickupLocation}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="md:col-span-1 flex flex-col justify-between items-end">
                      <div className="text-right mb-4">
                        <div className="text-2xl font-bold text-primary">
                          ${booking.totalPrice}
                        </div>
                        <p className="text-sm text-muted-foreground">Total amount</p>
                      </div>

                      <div className="w-full space-y-2">
                        {booking.status !== 'cancelled' && !isPast && (
                          <button
                            onClick={() => {
                              if (canCancel(booking.startDate)) {
                                handleCancel(booking.id)
                              } else {
                                alert('Cannot cancel within 24 hours of pickup')
                              }
                            }}
                            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold text-sm"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'confirmed' && !isPast && (
                          <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm">
                            Contact Support
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
