import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

function BookingsPage({ onNavigate }) {
  const { user } = useAuth()
  const { bookings, vehicles } = useData()

  const userBookings = bookings.filter(b => b.userId === user?.id)

  const handleCancel = (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      // In a real app, you'd call deleteBooking here
      console.log('Cancel booking:', bookingId)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '32px' }}>My Bookings</h1>

        {userBookings.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '48px 20px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '16px' }}>No bookings yet</p>
            <button onClick={() => onNavigate('search')} className="primary">Search Cars</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userBookings.map((booking) => {
              const vehicle = vehicles.find(v => v.id === booking.vehicleId)
              return (
                <div key={booking.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-light)' }}>{vehicle?.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Booking ID: {booking.id}</p>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: booking.status === 'confirmed' ? '#1a4d2e' : '#4d2626', color: booking.status === 'confirmed' ? '#6eed9e' : '#ff8080' }}>
                        {booking.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Start Date</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>{new Date(booking.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>End Date</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>{new Date(booking.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>{booking.totalDays} days</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Total</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '16px' }}>${booking.totalPrice}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onNavigate('vehicle', { id: booking.vehicleId })} className="secondary" style={{ padding: '8px 12px', fontSize: '14px' }}>
                        View Details
                      </button>
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleCancel(booking.id)} style={{ padding: '8px 12px', fontSize: '14px', backgroundColor: 'var(--secondary)', color: '#ff8080', border: '1px solid #ff8080', borderRadius: '4px', cursor: 'pointer' }}>
                          Cancel Booking
                        </button>
                      )}
                    </div>
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
