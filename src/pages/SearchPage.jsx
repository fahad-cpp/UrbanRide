import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { VehicleCard } from './HomePage'
import '../styles/search-page.css'

function getGridColumns(w) {
  if (w < 768) return '1fr'
  if (w < 1024) return 'repeat(2, 1fr)'
  return 'repeat(3, 1fr)'
}

const ITEMS_PER_PAGE = 25

function SearchPage({ onNavigate, searchParams }) {
  const { isLoggedIn } = useAuth()

  const [selectedType, setSelectedType] = useState('')
  const [location, setLocation] = useState(searchParams?.location || '')
  const [startDate, setStartDate] = useState(searchParams?.startDate || '')
  const [endDate, setEndDate] = useState(searchParams?.endDate || '')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // PERF: debounced resize — avoids spamming setState at 60fps during window drag
  useEffect(() => {
    let timer
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setScreenWidth(window.innerWidth), 150)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize) }
  }, [])

  useEffect(() => { setCurrentPage(1) }, [location, selectedType])

  // PERF: AbortController cancels stale in-flight requests when filters change fast
  useEffect(() => {
    const controller = new AbortController()
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: currentPage, limit: ITEMS_PER_PAGE, location: location || '' })
        const response = await fetch(`http://localhost:5000/api/vehicles/paginated?${params}`, { signal: controller.signal })
        const data = await response.json()
        if (data.vehicles) {
          const filtered = selectedType ? data.vehicles.filter(v => v.type === selectedType) : data.vehicles
          setVehicles(filtered)
          setTotalPages(data.pagination.pages)
        } else {
          setVehicles([])
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching vehicles:', err)
          setVehicles([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchVehicles()
    return () => controller.abort()
  }, [currentPage, location, selectedType])

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return null
    return Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000)
  }, [startDate, endDate])

  const gridColumns = useMemo(() => getGridColumns(screenWidth), [screenWidth])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }
  }, [currentPage, totalPages])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }
  }, [currentPage])

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
        <form onSubmit={e => e.preventDefault()} className="search-form">
          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" required>
              <option value="">Select Location</option>
              {['Ahmedabad','Vadodara','Gandhinagar','Surat','Jamnagar','Anand','Rajkot','Bhavnagar'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate" className="form-label">Pickup Date</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label htmlFor="endDate" className="form-label">Return Date</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" required />
          </div>

          <button type="submit" className="btn-search">
            <span>Refine</span>
            <span className="btn-arrow">→</span>
          </button>
        </form>

        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="vehicleType" className="filter-label">Vehicle Type</label>
            <select id="vehicleType" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
              <option value="">All Types</option>
              {['Electric','Hatchback','Luxury','MPV','SUV','Sedan','Sports'].map(t => (
                <option key={t} value={t}>{t}</option>
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
          <div className="loading-state"><p>Loading vehicles...</p></div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">-</div>
            <h2>No vehicles found</h2>
            <p>Try adjusting your search criteria or dates</p>
            <button onClick={() => onNavigate('home')} className="btn-back-home">Back to Home</button>
          </div>
        ) : (
          <div>
            <div className="results-header">
              <h2 className="results-title">Available Vehicles</h2>
              <p className="results-count">
                Showing {vehicles.length} result{vehicles.length !== 1 ? 's' : ''}{totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}
              </p>
            </div>

            <div className="vehicles-grid" style={{ gridTemplateColumns: gridColumns }}>
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isLoggedIn={isLoggedIn}
                  onNavigate={onNavigate}
                  startDate={startDate}
                  endDate={endDate}
                  totalDays={totalDays}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn-pagination">← Previous</button>
                <div className="pagination-info">Page {currentPage} of {totalPages}</div>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn-pagination">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage