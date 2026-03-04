import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { ArrowLeft } from 'lucide-react'
import '../styles/vehicle-detail.css'

function VehicleDetailPage({ vehicleId, onNavigate, searchParams }) {
  const { user } = useAuth()
  const { getVehicleById, createBooking, addEmail } = useData()

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
      <div className="vehicle-detail-loading">
        <div className="spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="vehicle-detail-error">
        <div className="error-content">
          <div className="error-icon">-</div>
          <h2>Vehicle Not Found</h2>
          <p>Sorry, we couldn't find the vehicle you're looking for.</p>
          <button onClick={() => onNavigate('search')} className="btn-back-search">
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

      const bookingId = await createBooking({
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
      <div className="vehicle-detail-success">
        <div className="success-card">
          <div className="success-icon">Success</div>
          <h2 className="success-title">Booking Confirmed</h2>
          <p className="success-message">
            Confirmation email sent to <span className="user-email">{user.email}</span>
          </p>
          <div className="booking-id-display">
            <span className="id-label">Booking ID</span>
            <span className="id-value">{confirmationId}</span>
          </div>
          <button onClick={() => onNavigate('bookings')} className="btn-view-bookings">
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="vehicle-detail-page">
      <div className="vehicle-detail-header">
        <button
          onClick={() => onNavigate('search', searchParams)}
          className="btn-back-nav"
        >
          <ArrowLeft size={20} />
          Back to Results
        </button>
      </div>

      <div className="vehicle-detail-container">
        <div className="vehicle-detail-grid">
          
          <div className="vehicle-main">
            <div className="vehicle-image-section">
              <img src={vehicle.image} alt={vehicle.name} className="vehicle-detail-image" />
              <div className="image-badge">{vehicle.type}</div>
            </div>

            <div className="vehicle-info-card">
              <div className="vehicle-header-info">
                <h1 className="vehicle-title">
                  {vehicle.brand} {vehicle.name}
                  <span className="vehicle-model-detail">{vehicle.model}</span>
                </h1>
              </div>

              <div className="vehicle-details-grid">
                <div className="detail-row">
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{vehicle.year}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transmission</span>
                  <span className="detail-value">{vehicle.transmission}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fuel Type</span>
                  <span className="detail-value">{vehicle.fuelType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Seats</span>
                  <span className="detail-value">{vehicle.seats || '-'}</span>
                </div>
              </div>

              <div className="price-highlight">
                <span className="price-label">Daily Rate</span>
                <span className="price-display">₹{vehicle.pricePerDay}</span>
              </div>
            </div>
          </div>

          <div className="booking-sidebar">
            <div className="booking-card">
              <h2 className="booking-title">Book This Vehicle</h2>

              <div className="booking-form-group">
                <div className="form-field">
                  <label className="form-label">Pickup Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-date-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-date-input"
                    required
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="booking-summary">
                  <div className="summary-row">
                    <span className="summary-label">Duration</span>
                    <span className="summary-value">{totalDays} days</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Rate per day</span>
                    <span className="summary-value">₹{vehicle.pricePerDay}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span className="summary-label">Total Amount</span>
                    <span className="summary-value total-price">₹{totalPrice}</span>
                  </div>
                </div>
              )}

              {!showPayment ? (
                <button
                  onClick={() => setShowPayment(true)}
                  disabled={totalDays <= 0}
                  className="btn-proceed-payment"
                >
                  <span>Proceed to Payment</span>
                  <span className="btn-arrow">→</span>
                </button>
              ) : (
                <form onSubmit={handlePayment} className="payment-form">
                  <h3 className="payment-title">Payment Details</h3>

                  <div className="payment-inputs">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="Card Number"
                      className="payment-input"
                      maxLength="16"
                      required
                    />
                    <div className="payment-row">
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="payment-input half"
                        required
                      />
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="CVV"
                        className="payment-input half"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <div className="payment-buttons">
                    <button type="submit" disabled={loading} className="btn-pay-now">
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                    <button type="button" onClick={() => setShowPayment(false)} className="btn-cancel-payment">
                      Cancel
                    </button>
                  </div>
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