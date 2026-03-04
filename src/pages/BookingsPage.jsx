import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import '../styles/bookings-page.css'

const API_BASE = "http://localhost:5000/api"

function BookingsPage({ onNavigate }) {
  const { token } = useAuth()
  const { bookings, vehicles, fetchMyBookings } = useData()
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return

    setCancelling(bookingId)
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        setSuccessMessage("Booking cancelled successfully")
        await fetchMyBookings()
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "status-pending"
    switch (status) {
      case "confirmed":
        return "status-confirmed"
      case "pending":
        return "status-pending"
      case "cancelled":
        return "status-cancelled"
      default:
        return "status-pending"
    }
  }

  const getStatusLabel = (status) => {
    if (!status) return "Pending"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="bookings-page">
      {/* Header */}
      <div className="bookings-header">
        <div className="bookings-header-content">
          <div>
            <h1 className="bookings-title">My Bookings</h1>
            <p className="bookings-subtitle">
              Manage your car rental reservations
            </p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">Success</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Content */}
      <div className="bookings-container">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">-</div>
            <h2>No bookings yet</h2>
            <p>Start your journey by booking a car today</p>
            <button
              className="btn-search-cars"
              onClick={() => onNavigate("search")}
            >
              <span className="btn-icon">Search</span>
              Browse Available Cars
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking, index) => {
              const vehicle = vehicles.find(
                (v) => v.id === booking.vehicleId
              )

              const start = new Date(booking.startDate)
              const end = new Date(booking.endDate)
              const totalDays = Math.ceil(
                (end - start) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={booking.id}
                  className="booking-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() =>
                    setExpandedBooking(
                      expandedBooking === booking.id ? null : booking.id
                    )
                  }
                >
                  {/* Card Header */}
                  <div className="booking-card-header">
                    <div className="booking-vehicle-info">
                      {vehicle?.image && (
                        <img
                          src={vehicle.image}
                          alt={vehicle?.name}
                          className="booking-vehicle-thumb"
                        />
                      )}
                      <div className="vehicle-details">
                        <h3 className="vehicle-title">
                          {vehicle?.brand} {vehicle?.name}
                        </h3>
                        <p className="booking-id">ID: {booking.id}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="booking-card-body">
                    <div className="booking-timeline">
                      <div className="timeline-item">
                        <span className="timeline-label">Pickup</span>
                        <span className="timeline-date">
                          {start.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="timeline-arrow">→</div>
                      <div className="timeline-item">
                        <span className="timeline-label">Return</span>
                        <span className="timeline-date">
                          {end.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{totalDays} days</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Daily Rate</span>
                        <span className="detail-value">
                          ₹{vehicle?.pricePerDay || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Cost</span>
                        <span className="detail-value total-price">
                          ₹{booking.totalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Section */}
                    {expandedBooking === booking.id && (
                      <div className="booking-expanded">
                        <div className="expanded-divider"></div>

                        <div className="vehicle-specs">
                          <div className="spec-row">
                            <span className="spec-name">Type</span>
                            <span className="spec-value">
                              {vehicle?.type || "N/A"}
                            </span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-name">Seats</span>
                            <span className="spec-value">
                              {vehicle?.seats || "N/A"}
                            </span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-name">Transmission</span>
                            <span className="spec-value">
                              {vehicle?.transmission || "N/A"}
                            </span>
                          </div>
                          <div className="spec-row">
                            <span className="spec-name">Fuel Type</span>
                            <span className="spec-value">
                              {vehicle?.fuelType || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="booking-actions">
                          <button
                            className="btn-view-details"
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigate("vehicle", {
                                id: booking.vehicleId
                              })
                            }}
                          >
                            View Vehicle Details
                          </button>

                          {booking.status === "confirmed" && (
                            <button
                              className="btn-cancel"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancel(booking.id)
                              }}
                              disabled={cancelling === booking.id}
                            >
                              {cancelling === booking.id
                                ? "Cancelling..."
                                : "Cancel Booking"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand Indicator */}
                  <div className="card-expand-indicator">
                    <span className="indicator-text">
                      {expandedBooking === booking.id ? "Collapse" : "Expand"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingsPage