import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

const SAMPLE_VEHICLES = [
  { id: 1, name: 'Toyota Corolla', brand: 'Toyota', model: 'Corolla', year: 2024, type: 'economy', seats: 5, transmission: 'automatic', fuelType: 'petrol', pricePerDay: 45, location: 'New York', image: 'https://images.unsplash.com/photo-1584345604159-7ad6c29a3f41?w=400&h=300&fit=crop' },
  { id: 2, name: 'Honda Civic', brand: 'Honda', model: 'Civic', year: 2024, type: 'compact', seats: 5, transmission: 'automatic', fuelType: 'petrol', pricePerDay: 55, location: 'New York', image: 'https://images.unsplash.com/photo-1606611013016-969c19d91e17?w=400&h=300&fit=crop' },
  { id: 3, name: 'BMW 3 Series', brand: 'BMW', model: '3 Series', year: 2024, type: 'sedan', seats: 5, transmission: 'automatic', fuelType: 'diesel', pricePerDay: 120, location: 'Los Angeles', image: 'https://images.unsplash.com/photo-1554744512-d2c2a3e6aad7?w=400&h=300&fit=crop' },
  { id: 4, name: 'Tesla Model 3', brand: 'Tesla', model: 'Model 3', year: 2024, type: 'sedan', seats: 5, transmission: 'automatic', fuelType: 'electric', pricePerDay: 140, location: 'San Francisco', image: 'https://images.unsplash.com/photo-1618462586858-61660c8a0e4d?w=400&h=300&fit=crop' },
  { id: 5, name: 'Toyota RAV4', brand: 'Toyota', model: 'RAV4', year: 2024, type: 'suv', seats: 7, transmission: 'automatic', fuelType: 'petrol', pricePerDay: 85, location: 'Chicago', image: 'https://images.unsplash.com/photo-1566023967268-70ff3b30bfef?w=400&h=300&fit=crop' },
  { id: 6, name: 'Mercedes GLE', brand: 'Mercedes', model: 'GLE', year: 2024, type: 'luxury', seats: 7, transmission: 'automatic', fuelType: 'diesel', pricePerDay: 200, location: 'Miami', image: 'https://images.unsplash.com/photo-1626703387984-b41c79c73e6c?w=400&h=300&fit=crop' },
  { id: 7, name: 'Mazda 3', brand: 'Mazda', model: '3', year: 2024, type: 'compact', seats: 5, transmission: 'manual', fuelType: 'petrol', pricePerDay: 50, location: 'New York', image: 'https://images.unsplash.com/photo-1621202573908-5427f23fd0bb?w=400&h=300&fit=crop' },
  { id: 8, name: 'Audi Q5', brand: 'Audi', model: 'Q5', year: 2024, type: 'suv', seats: 5, transmission: 'automatic', fuelType: 'petrol', pricePerDay: 150, location: 'Los Angeles', image: 'https://images.unsplash.com/photo-1606527586906-bae5a2e4b922?w=400&h=300&fit=crop' }
]

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES)
  const [bookings, setBookings] = useState([])
  const [emails, setEmails] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('urbanride_bookings')
    if (stored) setBookings(JSON.parse(stored))
    
    const storedEmails = localStorage.getItem('urbanride_emails')
    if (storedEmails) setEmails(JSON.parse(storedEmails))
  }, [])

  const searchVehicles = (location, startDate, endDate) => {
    if (!location) return vehicles
    return vehicles.filter(v => v.location === location)
  }

  const getVehicleById = (id) => vehicles.find(v => v.id === parseInt(id))

  const addBooking = async (bookingData) => {
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString()
    }
    const updated = [...bookings, booking]
    setBookings(updated)
    localStorage.setItem('urbanride_bookings', JSON.stringify(updated))
    return booking.id
  }

  const getUserBookings = (userId) => bookings.filter(b => b.userId === userId)

  const cancelBooking = (bookingId) => {
    const updated = bookings.filter(b => b.id !== bookingId)
    setBookings(updated)
    localStorage.setItem('urbanride_bookings', JSON.stringify(updated))
  }

  const addVehicle = (vehicleData) => {
    const newVehicle = {
      id: Math.max(...vehicles.map(v => v.id), 0) + 1,
      ...vehicleData
    }
    const updated = [...vehicles, newVehicle]
    setVehicles(updated)
    localStorage.setItem('urbanride_vehicles', JSON.stringify(updated))
    return newVehicle.id
  }

  const updateVehicle = (id, updates) => {
    const updated = vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
    setVehicles(updated)
    localStorage.setItem('urbanride_vehicles', JSON.stringify(updated))
  }

  const deleteVehicle = (id) => {
    const updated = vehicles.filter(v => v.id !== id)
    setVehicles(updated)
    localStorage.setItem('urbanride_vehicles', JSON.stringify(updated))
  }

  const addEmail = (emailData) => {
    const email = {
      id: Date.now().toString(),
      ...emailData,
      createdAt: new Date().toISOString()
    }
    const updated = [...emails, email]
    setEmails(updated)
    localStorage.setItem('urbanride_emails', JSON.stringify(updated))
  }

  return (
    <DataContext.Provider value={{
      vehicles,
      bookings,
      emails,
      searchVehicles,
      getVehicleById,
      addBooking,
      getUserBookings,
      cancelBooking,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addEmail
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
