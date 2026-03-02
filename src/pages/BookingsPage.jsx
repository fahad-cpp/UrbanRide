import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

const API_BASE = "http://localhost:5000/api"

function BookingsPage({ onNavigate }) {
  const { token } = useAuth()
  const { bookings, vehicles, fetchMyBookings } = useData()

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return

    await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    fetchMyBookings()
  }

  return (
    <div style={{ padding: "32px 20px" }}>
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div>
          <p>No bookings yet</p>
          <button onClick={() => onNavigate("search")}>
            Search Cars
          </button>
        </div>
      ) : (
        bookings.map((booking) => {
          const vehicle = vehicles.find(
            (v) => v.id === booking.vehicleId
          )

          const start = new Date(booking.startDate)
          const end = new Date(booking.endDate)
          const totalDays =
            (end - start) / (1000 * 60 * 60 * 24)

          return (
            <div key={booking.id} style={{ marginBottom: 20 }}>
              <h3>{vehicle?.name}</h3>
              <p>Booking ID: {booking.id}</p>
              <p>Status: {booking.status}</p>
              <p>Start: {start.toLocaleDateString()}</p>
              <p>End: {end.toLocaleDateString()}</p>
              <p>Duration: {totalDays} days</p>
              <p>Total: ${booking.totalPrice}</p>

              <button
                onClick={() =>
                  onNavigate("vehicle", { id: booking.vehicleId })
                }
              >
                View Details
              </button>

              {booking.status === "confirmed" && (
                <button
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default BookingsPage