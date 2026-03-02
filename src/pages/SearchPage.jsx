import { useState, useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'

function SearchPage({ onNavigate, searchParams }) {
  const { searchVehicles } = useData()
  const { isLoggedIn } = useAuth()

  const [selectedType, setSelectedType] = useState('')
  const [location, setLocation] = useState(searchParams?.location || '')
  const [startDate, setStartDate] = useState(searchParams?.startDate || '')
  const [endDate, setEndDate] = useState(searchParams?.endDate || '')
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const results = searchVehicles(location, startDate, endDate).filter(v =>
    !selectedType || v.type === selectedType
  )

  const formColumns =
    screenWidth < 768 ? '1fr' : 'repeat(4, 1fr)'

  const gridColumns =
    screenWidth < 768
      ? '1fr'
      : screenWidth < 1024
      ? 'repeat(2, 1fr)'
      : 'repeat(3, 1fr)'

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-dark)', padding: '32px 20px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '32px',
            border: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: formColumns,
            gap: '12px',
            alignItems: 'flex-end'
          }}
        >
          <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%' }}>
            <option value="">Location</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%' }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%' }} />

          <button type="submit" className="primary" style={{ width: '100%' }}>
            Search
          </button>
        </form>

        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: '500', marginBottom: '12px', color: 'var(--text-light)' }}>
            Type
          </h3>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: '100%' }}>
            <option value="">All Types</option>
            {['economy', 'compact', 'sedan', 'suv', 'luxury'].map(t => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-light)' }}>
          {results.length} Cars Available
        </h2>

        {results.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', padding: '32px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              No vehicles found
            </p>
            <button onClick={() => onNavigate('home')} className="primary">
              Back Home
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '16px' }}>
            {results.map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' }}>
                    {vehicle.name}
                  </h3>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <p>{vehicle.seats} seats • {vehicle.transmission}</p>
                    <p>{vehicle.type} • {vehicle.fuelType}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      ₹{vehicle.pricePerDay}/day
                    </span>

                    {isLoggedIn ? (
                      <button
                        onClick={() =>
                          onNavigate('vehicle', { id: vehicle.id, startDate, endDate })
                        }
                        className="primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Book
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: 'var(--secondary)',
                          color: 'var(--text-muted)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'not-allowed'
                        }}
                      >
                        Login to Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage