import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/search-page.css'

function SearchPage({ onNavigate, searchParams }) {
  const { isLoggedIn } = useAuth()

  const [selectedType, setSelectedType] = useState('')
  const [location, setLocation] = useState(searchParams?.location || '')
  const [startDate, setStartDate] = useState(searchParams?.startDate || '')
  const [endDate, setEndDate] = useState(searchParams?.endDate || '')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [hoveredVehicle, setHoveredVehicle] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [location, selectedType])

  useEffect(() => {
    fetchVehicles(currentPage)
  }, [currentPage, location, selectedType])

  const fetchVehicles = async (page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: ITEMS_PER_PAGE,
        location: location || '',
      })

      const response = await fetch(
        `http://localhost:5000/api/vehicles/paginated?${params}`
      )
      const data = await response.json()

      if (data.vehicles) {
        // Filter by selected type if any
        const filtered = selectedType 
          ? data.vehicles.filter(v => v.type === selectedType)
          : data.vehicles
        
        setVehicles(filtered)
        setTotalPages(data.pagination.pages)
      } else {
        setVehicles([])
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const gridColumns =
    screenWidth < 768
      ? '1fr'
      : screenWidth < 1024
      ? 'repeat(2, 1fr)'
      : 'repeat(3, 1fr)'

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  const totalDays = calculateDays()

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-header-content">
          <div>
            <h1 className="search-title">Find Your Ride</h1>
            <p className="search-subtitle">
              {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} available for your journey
            </p>
          </div>
        </div>
      </div>

      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
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
              className="form-input"
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
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn-search">
            <span>Refine</span>
            <span className="btn-arrow">→</span>
          </button>
        </form>

        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="vehicleType" className="filter-label">Vehicle Type</label>
            <select
              id="vehicleType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {['Economy', 'Compact', 'Sedan', 'SUV', 'Luxury', 'Electric'].map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {totalDays && (
            <div className="trip-summary">
              <span className="summary-label">Trip Duration</span>
              <span className="summary-value">{totalDays} days</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">-</div>
            <h2>No vehicles found</h2>
            <p>Try adjusting your search criteria or dates</p>
            <button
              onClick={() => onNavigate('home')}
              className="btn-back-home"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div>
            <div className="results-header">
              <h2 className="results-title">
                Available Vehicles
              </h2>
              <p className="results-count">
                Showing {vehicles.length} result{vehicles.length !== 1 ? 's' : ''} {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            <div className="vehicles-grid" style={{ gridTemplateColumns: gridColumns }}>
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="vehicle-card search-vehicle-card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                  onMouseEnter={() => setHoveredVehicle(vehicle.id)}
                  onMouseLeave={() => setHoveredVehicle(null)}
                >
                  <div className="vehicle-image-wrapper">
                    <img
                      src={vehicle.image || '/placeholder.png'}
                      alt={vehicle.name}
                      className="vehicle-image"
                      width="1920"
                      height="1080"
                    />
                    <div className="image-overlay"></div>
                    <div className="price-badge">
                      <span className="price-currency">₹</span>
                      <span className="price-amount">{vehicle.pricePerDay}</span>
                      <span className="price-period">/day</span>
                    </div>
                  </div>

                  <div className="vehicle-card-content">
                    <h3 className="vehicle-card-title">
                      {vehicle.brand}
                      <span className="vehicle-model">{vehicle.name}</span>
                    </h3>

                    <div className="vehicle-specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Seats</span>
                        <span className="spec-value">{vehicle.seats}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Trans</span>
                        <span className="spec-value">{vehicle.transmission}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Type</span>
                        <span className="spec-value">{vehicle.type}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Fuel</span>
                        <span className="spec-value">{vehicle.fuelType}</span>
                      </div>
                    </div>

                    {totalDays && (
                      <div className="trip-cost">
                        <span className="cost-label">Total for {totalDays} days</span>
                        <span className="cost-value">₹{vehicle.pricePerDay * totalDays}</span>
                      </div>
                    )}

                    {isLoggedIn ? (
                      <button
                        onClick={() =>
                          onNavigate('vehicle', { id: vehicle.id, startDate, endDate })
                        }
                        className="btn-book"
                      >
                        Book Now
                        <span className="btn-icon">→</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="btn-login-required"
                      >
                        Login to Book
                      </button>
                    )}
                  </div>

                  {hoveredVehicle === vehicle.id && (
                    <div className="card-shine"></div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="btn-pagination"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage