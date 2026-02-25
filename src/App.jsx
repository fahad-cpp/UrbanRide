import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import BookingsPage from './pages/BookingsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [searchParams, setSearchParams] = useState({})

  const navigate = (page, params = {}) => {
    setCurrentPage(page)
    setSearchParams(params)
    window.scrollTo(0, 0)
  }

  return (
    <AuthProvider>
      <DataProvider>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-light)' }}>
          <Navigation onNavigate={navigate} currentPage={currentPage} />
          
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}
          {currentPage === 'search' && <SearchPage onNavigate={navigate} searchParams={searchParams} />}
          {currentPage === 'vehicle' && <VehicleDetailPage vehicleId={searchParams.id} onNavigate={navigate} searchParams={searchParams} />}
          {currentPage === 'bookings' && <BookingsPage onNavigate={navigate} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={navigate} />}
          {currentPage === 'admin' && <AdminPage onNavigate={navigate} />}
        </div>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
