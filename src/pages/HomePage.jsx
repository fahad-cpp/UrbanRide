import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function HomePage({ onNavigate }) {
  const { isLoggedIn } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(res => res.json())
      .then(data => {
        console.log('Vehicles API response:', data)

        if (Array.isArray(data)) {
          setVehicles(data)
        } else if (data && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles)
        } else {
          setVehicles([])
        }
      })
      .catch(err => {
        console.error('Error fetching vehicles:', err)
        setVehicles([])
      })
  }, [])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (location && startDate && endDate) {
      onNavigate('search', { location, startDate, endDate })
    }
  }

  const features = [
    { title: 'Easy Booking', description: 'Book your car in minutes' },
    { title: 'Wide Selection', description: 'Multiple vehicle categories' },
    { title: 'Best Prices', description: 'Competitive rates guaranteed' },
    { title: '24/7 Support', description: 'Always available to help' },
    { title: 'Safe & Secure', description: 'Insured and maintained' },
    { title: 'Flexible Terms', description: 'Cancel anytime within 24 hours' },
  ]

  const getSearchFormColumns = () => (windowWidth < 768 ? '1fr' : 'repeat(4, 1fr)')
  const getVehicleGridColumns = () =>
    windowWidth < 768 ? '1fr' : windowWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  return (
    <div>
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #1e7db8 100%)',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Find Your Perfect Ride
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Simple, affordable car rentals for every journey
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '4px',
              padding: '16px',
              maxWidth: '60rem',
              margin: '0 auto 32px auto',
              display: 'grid',
              gridTemplateColumns: getSearchFormColumns(),
              gap: '12px',
              alignItems: 'flex-end',
            }}
          >
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%' }}
              required
            >
              <option value="">Location</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Chicago">Chicago</option>
              <option value="Miami">Miami</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%' }}
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%' }}
              required
            />
            <button type="submit" className="primary" style={{ width: '100%' }}>
              Search
            </button>
          </form>

          {!isLoggedIn && (
            <button
              onClick={() => onNavigate('home')}
              className="primary"
              style={{ padding: '12px 32px', fontSize: '18px' }}
            >
              Get Started
            </button>
          )}
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '32px',
              color: 'var(--text-light)',
            }}
          >
            Popular Vehicles
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: getVehicleGridColumns(),
              gap: '16px',
            }}
          >
            {Array.isArray(vehicles) &&
              vehicles.slice(0, 4).map((vehicle, index) => (
                <div
                  key={vehicle.id || index}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: '160px',
                      backgroundColor: 'var(--secondary)',
                    }}
                  >
                    <img
                      src={vehicle.image || '/placeholder.png'}
                      alt={vehicle.name || 'Vehicle'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'var(--primary)',
                        color: '#0d0d0d',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      ${vehicle.pricePerDay || 'N/A'}/day
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'var(--text-light)',
                        marginBottom: '12px',
                      }}
                    >
                      {vehicle.name || 'Unknown'}
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div>{vehicle.seats || '-'} seats</div>
                      <div>{vehicle.transmission || '-'}</div>
                      <div>{vehicle.type || '-'}</div>
                      <div>{vehicle.fuelType || '-'}</div>
                    </div>

                    {isLoggedIn ? (
                      <button
                        onClick={() => onNavigate('vehicle', { id: vehicle.id })}
                        className="primary"
                        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                      >
                        Book Now
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '14px',
                          backgroundColor: 'var(--secondary)',
                          color: 'var(--text-muted)',
                          cursor: 'not-allowed',
                          border: 'none',
                          borderRadius: '4px',
                        }}
                      >
                        Login to Book
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <footer
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '32px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}
        >
          <p>&copy; 2024 UrbanRide. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage