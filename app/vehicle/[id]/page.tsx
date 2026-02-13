'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useData, Booking } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Users, Fuel, Gauge, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { sendBookingConfirmation } from '@/lib/emailService'

export default function VehicleDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { vehicles, addBooking } = useData()
  const { user, isLoggedIn } = useAuth()

  const vehicleId = params.id as string
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const [showPayment, setShowPayment] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [confirmationId, setConfirmationId] = useState('')

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please login to book a vehicle</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Vehicle Not Found</h1>
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </main>
    )
  }

  const totalDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1
  const totalPrice = totalDays * vehicle.pricePerDay

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate card details
      if (!cardNumber || cardNumber.length < 16 || !expiryDate || !cvv) {
        throw new Error('Please enter valid payment details')
      }

      // Create booking
      const bookingId = await addBooking({
        userId: user!.id,
        vehicleId: vehicle.id,
        startDate,
        endDate,
        pickupLocation: vehicle.location,
        dropoffLocation: vehicle.location,
        totalDays,
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        confirmationEmail: user!.email,
      })

      // Send confirmation email
      await sendBookingConfirmation({
        customerName: user!.name,
        customerEmail: user!.email,
        vehicleName: vehicle.name,
        bookingId,
        startDate,
        endDate,
        pickupLocation: vehicle.location,
        dropoffLocation: vehicle.location,
        totalDays,
        totalPrice,
      })

      setConfirmationId(bookingId)
      setBookingConfirmed(true)

      // Reset form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setShowPayment(false)
    } catch (error: any) {
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-card rounded-xl shadow-lg p-8 text-center border border-border">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="text-green-600" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your reservation has been successfully created. A confirmation email has been sent to {user?.email}
            </p>

            <div className="bg-secondary rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-foreground text-lg mb-4">Booking Details</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Confirmation #:</span>
                  <span className="font-semibold text-foreground">{confirmationId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-semibold text-foreground">{vehicle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pick-up:</span>
                  <span className="font-semibold text-foreground">{startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drop-off:</span>
                  <span className="font-semibold text-foreground">{endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Days:</span>
                  <span className="font-semibold text-foreground">{totalDays}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold text-primary text-lg">${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/bookings" className="block">
                <Button className="w-full">View My Bookings</Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/search"
          className="flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft size={20} />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Image & Details */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-md overflow-hidden mb-8 border border-border">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="bg-card rounded-xl shadow-md p-8 space-y-8 border border-border">
              {/* Vehicle Info */}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{vehicle.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {vehicle.year} • {vehicle.brand} {vehicle.model}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary rounded-lg p-4">
                  <Users size={24} className="text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Passengers</div>
                  <div className="text-2xl font-bold text-foreground">{vehicle.seats}</div>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <Fuel size={24} className="text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Fuel Type</div>
                  <div className="text-2xl font-bold text-foreground capitalize">
                    {vehicle.fuelType}
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <Gauge size={24} className="text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Transmission</div>
                  <div className="text-2xl font-bold text-foreground capitalize">
                    {vehicle.transmission}
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <MapPin size={24} className="text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="text-2xl font-bold text-foreground">{vehicle.location}</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="text-green-600" size={20} />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">About This Vehicle</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Experience the comfort and reliability of our well-maintained {vehicle.name}. Perfect
                  for {vehicle.type === 'suv' ? 'families and group travels' : 'city driving and daily commute'}
                  . This {vehicle.year} model comes equipped with all the modern amenities and safety
                  features you need for a comfortable journey.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-card rounded-xl shadow-md p-8 sticky top-20 space-y-6 border border-border">
              <h3 className="text-2xl font-bold text-foreground">Booking Summary</h3>

              {/* Date Selection */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pick-up Date</p>
                  <p className="font-semibold text-foreground">{startDate || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Drop-off Date</p>
                  <p className="font-semibold text-foreground">{endDate || 'Not selected'}</p>
                </div>
                {totalDays > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold text-foreground">{totalDays} day(s)</p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per day</span>
                  <span className="font-semibold text-foreground">${vehicle.pricePerDay}</span>
                </div>
                {totalDays > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of days</span>
                      <span className="font-semibold text-foreground">{totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance (10%)</span>
                      <span className="font-semibold text-foreground">${Math.round(totalPrice * 0.1)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">
                  ${totalPrice + Math.round(totalPrice * 0.1)}
                </span>
              </div>

              {/* Action Buttons */}
              {startDate && endDate ? (
                <>
                  {showPayment ? (
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Processing...' : 'Complete Payment'}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setShowPayment(false)}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <Button
                      onClick={() => setShowPayment(true)}
                      className="w-full"
                    >
                      Proceed to Payment
                    </Button>
                  )}
                </>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please select dates from the search page to proceed with booking
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Free cancellation up to 24 hours before pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
