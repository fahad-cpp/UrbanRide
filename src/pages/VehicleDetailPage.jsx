import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { ArrowLeft } from 'lucide-react'

function VehicleDetailPage({ vehicleId, onNavigate, searchParams }) {
  const { user } = useAuth()
  const { getVehicleById, addBooking, addEmail } = useData()

  const [vehicle, setVehicle] = useState(null)
  const [loadingVehicle, setLoadingVehicle] = useState(true)
  const [startDate, setStartDate] = useState(searchParams?.startDate || '')
  const [endDate, setEndDate] = useState(searchParams?.endDate || '')
  const [showPayment, setShowPayment] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [confirmationId, setConfirmationId] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  useEffect(() => {
    const loadVehicle = async () => {
      const data = await getVehicleById(vehicleId)
      setVehicle(data)
      setLoadingVehicle(false)
    }

    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId])

  if (loadingVehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-light)' }}>Loading...</p>
      </div>
      )
  }
  if (!vehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px' }}>
            Vehicle not found
          </p>
          <button onClick={() => onNavigate('search')} className="primary">
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) return 0
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const totalDays = calculateDays()
  const totalPrice = totalDays * vehicle.pricePerDay

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!startDate || !endDate || totalDays <= 0) {
      alert('Please select valid dates')
      return
    }

    if (!cardNumber || cardNumber.length !== 16 || !expiryDate || !cvv || cvv.length !== 3) {
      alert('Please enter valid payment details')
      return
    }

    try {
      setLoading(true)

      const bookingId = await addBooking({
        userId: user.uid,
        vehicleId: vehicle.id,
        startDate,
        endDate,
        pickupLocation: vehicle.location,
        dropoffLocation: vehicle.location,
        totalDays,
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        confirmationEmail: user.email
      })

      await addEmail({
        to: user.email,
        subject: 'Booking Confirmation',
        type: 'booking_confirmation',
        vehicleName: vehicle.name,
        customerName: user.displayName || user.name,
        bookingId,
        startDate,
        endDate,
        totalPrice
      })

      setConfirmationId(bookingId)
      setBookingConfirmed(true)
      setShowPayment(false)
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
    } catch (error) {
      alert(error.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (bookingConfirmed) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '32px', textAlign: 'center', border: '1px solid var(--border)', maxWidth: '28rem', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '16px' }}>
            Booking Confirmed
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            Confirmation email sent to {user.email}
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '24px' }}>
            Booking ID: {confirmationId}
          </p>
          <button onClick={() => onNavigate('bookings')} className="primary" style={{ width: '100%' }}>
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        <button
          onClick={() => onNavigate('search', searchParams)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '32px' }}>
          
          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px', border: '1px solid var(--border)' }}>
              <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' }}>
                {vehicle.brand} {vehicle.name} {vehicle.model}
              </h1>
              <p style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
                Year : {vehicle.year}
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
                Transmission : {vehicle.transmission}
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                Fuel Type : {vehicle.fuelType}
              </p>
              <p style={{ color: 'var(--text-light)', marginBottom: '6px' }}>
                Price: ₹{vehicle.pricePerDay}/day
              </p>
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-light)' }}>
                Book This Vehicle
              </h2>

              <div>
                <label style={{ color: 'var(--text-light)' }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div>
                <label style={{ color: 'var(--text-light)' }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div>
                <p style={{ color: 'var(--text-light)' }}>Total: <strong>₹{totalPrice}</strong></p>
              </div>

              {!showPayment ? (
                <button
                  onClick={() => setShowPayment(true)}
                  disabled={totalDays <= 0}
                  className="primary"
                >
                  Proceed to Payment
                </button>
              ) : (
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="Card Number"
                  />
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="CVV"
                  />

                  <button type="submit" disabled={loading} className="primary">
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>

                  <button type="button" onClick={() => setShowPayment(false)} className="secondary">
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VehicleDetailPage