import { useState } from 'react'
import { useData } from '../contexts/DataContext'

function AdminPage({ onNavigate }) {
  const { vehicles, bookings, emails, addVehicle, deleteVehicle } = useData()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    pricePerDay: 50,
    image: ''
  })

  const totalVehicles = vehicles.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const totalBookings = bookings.length

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddVehicle = (e) => {
    e.preventDefault()
    addVehicle(formData)
    setFormData({ name: '', type: 'sedan', seats: 5, transmission: 'automatic', fuelType: 'petrol', pricePerDay: 50, image: '' })
    setShowAddVehicle(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '32px' }}>Admin Dashboard</h1>

        {selectedTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Vehicles</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)' }}>{totalVehicles}</p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Bookings</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)' }}>{confirmedBookings}</p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Revenue</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>${totalRevenue.toLocaleString()}</p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Bookings</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-light)' }}>{totalBookings}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-light)' }}>Recent Bookings</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Vehicle</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(-5).map((booking) => {
                      const vehicle = vehicles.find(v => v.id === booking.vehicleId)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-light)' }}>{booking.confirmationEmail || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-light)' }}>{vehicle?.name || 'Unknown'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '2px', backgroundColor: booking.status === 'confirmed' ? '#1a4d2e' : '#4d2626', color: booking.status === 'confirmed' ? '#6eed9e' : '#ff8080' }}>
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-light)' }}>${booking.totalPrice}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'vehicles' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <button onClick={() => setShowAddVehicle(!showAddVehicle)} className="primary">
                {showAddVehicle ? 'Cancel' : 'Add Vehicle'}
              </button>
            </div>

            {showAddVehicle && (
              <form onSubmit={handleAddVehicle} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', marginBottom: '32px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)', gap: '16px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '4px' }}>Vehicle Name</label>
                  <input type="text" name="name" placeholder="e.g. Tesla Model 3" value={formData.name} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="economy">Economy</option>
                  <option value="compact">Compact</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
                <input type="number" name="seats" placeholder="Seats" value={formData.seats} onChange={handleChange} required style={{ width: '100%' }} />
                <input type="number" name="pricePerDay" placeholder="Price per day" value={formData.pricePerDay} onChange={handleChange} required style={{ width: '100%' }} />
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                </select>
                <select name="transmission" value={formData.transmission} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
                <button type="submit" className="primary" style={{ width: '100%', gridColumn: window.innerWidth < 768 ? 'auto' : 'span 2' }}>
                  Add Vehicle
                </button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '16px' }}>
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '16px', border: '1px solid var(--border)' }}>
                  <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
                  <h3 style={{ fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' }}>{vehicle.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>${vehicle.pricePerDay}/day</p>
                  <button onClick={() => deleteVehicle(vehicle.id)} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--secondary)', color: '#ff8080', border: '1px solid #ff8080', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedTab === 'emails' && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '16px' }}>Email History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emails.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No emails sent</p>
              ) : (
                emails.slice(-20).map((email, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '4px' }}>{email.subject}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>To: {email.to}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Type: {email.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
          <button onClick={() => setSelectedTab('overview')} className={selectedTab === 'overview' ? 'primary' : 'secondary'} style={{ padding: '8px 16px', fontSize: '14px' }}>
            Overview
          </button>
          <button onClick={() => setSelectedTab('vehicles')} className={selectedTab === 'vehicles' ? 'primary' : 'secondary'} style={{ padding: '8px 16px', fontSize: '14px' }}>
            Vehicles
          </button>
          <button onClick={() => setSelectedTab('emails')} className={selectedTab === 'emails' ? 'primary' : 'secondary'} style={{ padding: '8px 16px', fontSize: '14px' }}>
            Emails
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
