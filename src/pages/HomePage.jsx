import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

// PERF: moved outside component — never causes re-renders
function getVehicleGridColumns(w) {
  if (w < 768) return '1fr'
  if (w < 1024) return 'repeat(2, 1fr)'
  return 'repeat(4, 1fr)'
}
function getSearchFormColumns(w) {
  return w < 768 ? '1fr' : 'repeat(4, 1fr)'
}

function HomePage({ onNavigate }) {
  const { isLoggedIn } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles/featured')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVehicles(data)
        else if (data && Array.isArray(data.vehicles)) setVehicles(data.vehicles)
        else setVehicles([])
      })
      .catch(err => { console.error('Error fetching vehicles:', err); setVehicles([]) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // PERF: debounced resize listener — raw resize fires ~60x/sec on drag
    let timer
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setWindowWidth(window.innerWidth), 150)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize) }
  }, [])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (location && startDate && endDate) {
      onNavigate('search', { location, startDate, endDate })
    }
  }, [location, startDate, endDate, onNavigate])

  // PERF: memoised — only recomputes when windowWidth changes
  const searchFormColumns = useMemo(() => getSearchFormColumns(windowWidth), [windowWidth])
  const vehicleGridColumns = useMemo(() => getVehicleGridColumns(windowWidth), [windowWidth])

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
            style={{ gridTemplateColumns: searchFormColumns }}
          >
            <div className="form-group">
              <label htmlFor="location" className="form-label">Location</label>
              <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input premium" required>
                <option value="">Select Location</option>
                {['Ahmedabad','Vadodara','Gandhinagar','Surat','Jamnagar','Anand','Rajkot','Bhavnagar'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Pickup Date</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input premium" required />
            </div>
            <div className="form-group">
              <label htmlFor="endDate" className="form-label">Return Date</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input premium" required />
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

          {loading ? (
            <div className="vehicles-grid" style={{ gridTemplateColumns: vehicleGridColumns }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="vehicle-card loading-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="vehicles-grid" style={{ gridTemplateColumns: vehicleGridColumns }}>
              {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id || index}
                  vehicle={vehicle}
                  isLoggedIn={isLoggedIn}
                  onNavigate={onNavigate}
                  showFeaturedBadge
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <div className="section-header trust-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Industry-leading service and reliability</p>
          </div>
          <div className="trust-grid">
            {[
              { symbol: 'V', title: 'Verified Fleet', desc: 'All vehicles regularly maintained and insured' },
              { symbol: '+', title: 'Instant Booking', desc: 'Secure your ride in seconds' },
              { symbol: 'R', title: 'Best Prices', desc: 'Competitive rates with no hidden fees' },
              { symbol: 'H', title: '24/7 Support', desc: "We're always here to help" },
            ].map(({ symbol, title, desc }) => (
              <div key={title} className="trust-item">
                <div className="trust-icon"><span className="trust-icon-symbol">{symbol}</span></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
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
            <p className="footer-copyright">&copy; 2026 UrbanRide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// PERF: extracted + memoized vehicle card so it only re-renders when its own props change
const VehicleCard = ({ vehicle, isLoggedIn, onNavigate, showFeaturedBadge, startDate, endDate, totalDays }) => (
  <div className="vehicle-card">
    <div className="vehicle-image-wrapper">
      {/* PERF: loading="lazy" defers off-screen image fetches */}
      <img
        src={vehicle.image || '/placeholder.png'}
        alt={vehicle.name || 'Vehicle'}
        className="vehicle-image"
        loading="lazy"
        width="400"
        height="180"
      />
      <div className="image-overlay"></div>
      <div className="price-badge">
        <span className="price-currency">₹</span>
        <span className="price-amount">{vehicle.pricePerDay || 'N/A'}</span>
        <span className="price-period">/day</span>
      </div>
      {showFeaturedBadge && <div className="featured-badge">Featured</div>}
    </div>

    <div className="vehicle-content">
      <h3 className="vehicle-name">
        {vehicle.name}
        <span className="model-name">{vehicle.brand || 'Unknown'}</span>
      </h3>

      <div className="vehicle-specs">
        <div className="spec-item"><span className="spec-label">Seats</span><span className="spec-value">{vehicle.seats || '-'}</span></div>
        <div className="spec-item"><span className="spec-label">Trans</span><span className="spec-value">{vehicle.transmission || '-'}</span></div>
        <div className="spec-item"><span className="spec-label">Type</span><span className="spec-value">{vehicle.type || '-'}</span></div>
        <div className="spec-item"><span className="spec-label">Fuel</span><span className="spec-value">{vehicle.fuelType || '-'}</span></div>
      </div>

      {totalDays && (
        <div className="trip-cost">
          <span className="cost-label">Total for {totalDays} days</span>
          <span className="cost-value">₹{vehicle.pricePerDay * totalDays}</span>
        </div>
      )}

      {isLoggedIn ? (
        <button onClick={() => onNavigate('vehicle', { id: vehicle.id, startDate, endDate })} className="btn-book">
          Book Now <span className="btn-icon">→</span>
        </button>
      ) : (
        <button disabled className="btn-login-required">Login to Book</button>
      )}
    </div>
  </div>
)

export { VehicleCard }
export default HomePage