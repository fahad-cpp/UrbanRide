import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function HomePage({ onNavigate }) {
  const { isLoggedIn } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(res => res.json())
      .then(data => {
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

  const getSearchFormColumns = () => (windowWidth < 768 ? '1fr' : 'repeat(4, 1fr)')
  const getVehicleGridColumns = () =>
    windowWidth < 768 ? '1fr' : windowWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
        </div>
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your <span className="highlight">Perfect Ride</span>
            </h1>
            <p className="hero-subtitle">
              Premium vehicle rentals. Zero hassle. Maximum freedom.
            </p>
          </div>

          <form 
            className="search-form-premium" 
            onSubmit={handleSearch} 
            style={{ gridTemplateColumns: getSearchFormColumns() }}
          >
            <div className="form-group">
              <label htmlFor="location" className="form-label">Location</label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input premium"
                required
              >
                <option value="">Select Location</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Pickup Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input premium"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">Return Date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input premium"
                required
              />
            </div>
            <button type="submit" className="btn-search">
              <span>Search Vehicles</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>
        </div>
      </section>

      <section className="vehicles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Fleet</h2>
            <p className="section-subtitle">Handpicked vehicles for your journey</p>
          </div>

          <div className="vehicles-grid" style={{ gridTemplateColumns: getVehicleGridColumns() }}>
            {Array.isArray(vehicles) &&
              vehicles.slice(0, 4).map((vehicle, index) => (
                <div 
                  key={vehicle.id || index} 
                  className="vehicle-card"
                  onMouseEnter={() => setHoveredCard(vehicle.id || index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="vehicle-image-wrapper">
                    <img
                      src={vehicle.image || '/placeholder.png'}
                      alt={vehicle.name || 'Vehicle'}
                      className="vehicle-image"
                    />
                    <div className="image-overlay"></div>
                    <div className="price-badge">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">{vehicle.pricePerDay || 'N/A'}</span>
                      <span className="price-period">/day</span>
                    </div>
                    <div className="featured-badge">Featured</div>
                  </div>

                  <div className="vehicle-content">
                    <h3 className="vehicle-name">
                      {vehicle.name}
                      <span className="model-name">{vehicle.brand || 'Unknown'}</span>
                    </h3>
                    
                    <div className="vehicle-specs">
                      <div className="spec-item">
                        <span className="spec-label">Seats</span>
                        <span className="spec-value">{vehicle.seats || '-'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Transmission</span>
                        <span className="spec-value">{vehicle.transmission || '-'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Type</span>
                        <span className="spec-value">{vehicle.type || '-'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Fuel</span>
                        <span className="spec-value">{vehicle.fuelType || '-'}</span>
                      </div>
                    </div>

                    {isLoggedIn ? (
                      <button
                        onClick={() => onNavigate('vehicle', { id: vehicle.id })}
                        className="btn-book"
                      >
                        Book Now
                        <span className="btn-icon">→</span>
                      </button>
                    ) : (
                      <button className="btn-login-required" disabled>
                        Login to Book
                      </button>
                    )}
                  </div>

                  {hoveredCard === (vehicle.id || index) && (
                    <div className="card-shine"></div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <div className="section-header trust-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Industry-leading service and reliability</p>
          </div>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">
                <span className="trust-icon-symbol">V</span>
              </div>
              <h3>Verified Fleet</h3>
              <p>All vehicles regularly maintained and insured</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <span className="trust-icon-symbol">+</span>
              </div>
              <h3>Instant Booking</h3>
              <p>Secure your ride in seconds</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <span className="trust-icon-symbol">R</span>
              </div>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <span className="trust-icon-symbol">H</span>
              </div>
              <h3>24/7 Support</h3>
              <p>We're always here to help</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>UrbanRide</h3>
              <p>Premium car rentals for every journey</p>
            </div>
            <p className="footer-copyright">&copy; 2024 UrbanRide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage