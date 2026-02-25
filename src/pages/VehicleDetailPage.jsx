import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { ArrowLeft } from 'lucide-react'

function VehicleDetailPage({ vehicleId, onNavigate, searchParams }) {
  const { user } = useAuth()
  const { getVehicleById, addBooking, addEmail } = useData()
  const vehicle = getVehicleById(vehicleId)

  const [startDate, setStartDate] = useState(searchParams?.startDate || '')
  const [endDate, setEndDate] = useState(searchParams?.endDate || '')
  const [showPayment, setShowPayment] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [confirmationId, setConfirmationId] = useState('')

  if (!vehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px' }}>Vehicle not found</p>
          <button onClick={() => onNavigate('search')} className="primary">Back to Search</button>
        </div>
      </div>
    )
  }

  const totalDays = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0
  const totalPrice = totalDays * vehicle.pricePerDay

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!cardNumber || cardNumber.length < 16 || !expiryDate || !cvv) {
        throw new Error('Please enter valid payment details')
      }

      const bookingId = await addBooking({
        userId: user.id,
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
        customerName: user.name,
        bookingId,
        startDate,
        endDate,
        totalPrice
      })

      setConfirmationId(bookingId)
      setBookingConfirmed(true)
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setShowPayment(false)
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
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '16px' }}>Booking Confirmed</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your booking has been confirmed. Confirmation email sent to {user.email}</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '24px' }}>Booking ID: {confirmationId}</p>
          <button onClick={() => onNavigate('bookings')} className="primary" style={{ width: '100%' }}>View My Bookings</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <button onClick={() => onNavigate('search', searchParams)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} />
          Back to Search
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '2fr 1fr', gap: '32px' }}>
          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px', border: '1px solid var(--border)' }}>
              <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' }}>{vehicle.name}</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{vehicle.year} {vehicle.brand} {vehicle.model}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Seats</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{vehicle.seats}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transmission</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{vehicle.transmission}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Type</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{vehicle.type}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fuel Type</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-light)' }}>{vehicle.fuelType}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-light)' }}>Book This Vehicle</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-light)' }}>
                  <span>Price per day:</span>
                  <span style={{ fontWeight: 'bold' }}>${vehicle.pricePerDay}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-light)' }}>
                  <span>Days:</span>
                  <span style={{ fontWeight: 'bold' }}>{totalDays || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>Total:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${totalPrice}</span>
                </div>
              </div>

              {!showPayment ? (
                <button onClick={() => setShowPayment(true)} disabled={!startDate || !endDate} className="primary" style={{ width: '100%', opacity: (!startDate || !endDate) ? 0.5 : 1 }}>
                  Proceed to Payment
                </button>
              ) : (
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Card Number</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" maxLength="16" style={{ width: '100%' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Expiry</label>
                      <input type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YY" maxLength="5" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>CVV</label>
                      <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" maxLength="3" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="primary" style={{ width: '100%', opacity: loading ? 0.5 : 1 }}>
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button type="button" onClick={() => setShowPayment(false)} className="secondary" style={{ width: '100%' }}>Cancel</button>
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
