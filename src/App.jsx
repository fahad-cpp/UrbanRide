import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import BookingsPage from './pages/BookingsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

function AppContent() {
  const { isLoggedIn, user } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [searchParams, setSearchParams] = useState({})

  const navigate = (page, params = {}) => {
    setCurrentPage(page)
    setSearchParams(params)
    window.scrollTo(0, 0)
  }

  const renderPage = () => {
    if (isLoggedIn && user?.role === 'admin' && currentPage !== 'admin') {
      return <AdminPage onNavigate={navigate} />
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />

      case 'search':
        return <SearchPage onNavigate={navigate} searchParams={searchParams} />

      case 'vehicle':
        if (!isLoggedIn) return <HomePage onNavigate={navigate} />
        return (
          <VehicleDetailPage
            vehicleId={searchParams.id}
            onNavigate={navigate}
            searchParams={searchParams}
          />
        )

      case 'bookings':
        if (!isLoggedIn) return <HomePage onNavigate={navigate} />
        return <BookingsPage onNavigate={navigate} />

      case 'profile':
        if (!isLoggedIn) return <HomePage onNavigate={navigate} />
        return <ProfilePage onNavigate={navigate} />

      case 'admin': {
        if (!isLoggedIn) return <HomePage onNavigate={navigate} />
        if (user?.role !== 'admin') return <HomePage onNavigate={navigate} />
        return <AdminPage onNavigate={navigate} />
      }

      default:
        return <HomePage onNavigate={navigate} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-light)' }}>
      <Navigation onNavigate={navigate} currentPage={currentPage} />
      {renderPage()}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App