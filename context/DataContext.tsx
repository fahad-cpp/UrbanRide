'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Vehicle {
  id: string
  name: string
  brand: string
  model: string
  year: number
  type: 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury'
  seats: number
  transmission: 'manual' | 'automatic'
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  mileage: number
  pricePerDay: number
  image: string
  available: boolean
  location: string
  features: string[]
}

export interface Booking {
  id: string
  userId: string
  vehicleId: string
  startDate: string
  endDate: string
  pickupLocation: string
  dropoffLocation: string
  totalDays: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid'
  createdAt: string
  confirmationEmail?: string
}

interface DataContextType {
  vehicles: Vehicle[]
  bookings: Booking[]
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<string>
  getBookingsByUser: (userId: string) => Booking[]
  cancelBooking: (bookingId: string) => void
  searchVehicles: (location: string, startDate: string, endDate: string) => Vehicle[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    name: 'Toyota Corolla',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    mileage: 0,
    pricePerDay: 45,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=400&fit=crop',
    available: true,
    location: 'New York',
    features: ['AC', 'Power Steering', 'ABS', 'Airbags'],
  },
  {
    id: '2',
    name: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic',
    year: 2024,
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    mileage: 0,
    pricePerDay: 50,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500&h=400&fit=crop',
    available: true,
    location: 'Los Angeles',
    features: ['AC', 'Power Steering', 'ABS', 'Sunroof'],
  },
  {
    id: '3',
    name: 'BMW X5',
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    type: 'suv',
    seats: 7,
    transmission: 'automatic',
    fuelType: 'diesel',
    mileage: 0,
    pricePerDay: 120,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=400&fit=crop',
    available: true,
    location: 'New York',
    features: ['AC', 'Leather Seats', 'Navigation', 'Premium Sound', 'Panoramic Roof'],
  },
  {
    id: '4',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'electric',
    mileage: 0,
    pricePerDay: 85,
    image: 'https://images.unsplash.com/photo-1560958089-b8a46dd52d1f?w=500&h=400&fit=crop',
    available: true,
    location: 'San Francisco',
    features: ['Autopilot', 'Fast Charging', 'Premium Audio', 'Glass Roof'],
  },
  {
    id: '5',
    name: 'Mercedes C-Class',
    brand: 'Mercedes',
    model: 'C-Class',
    year: 2024,
    type: 'luxury',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    mileage: 0,
    pricePerDay: 150,
    image: 'https://images.unsplash.com/photo-1606611013016-969ce3a24121?w=500&h=400&fit=crop',
    available: true,
    location: 'Los Angeles',
    features: ['Leather Interior', 'Navigation', 'Parking Assist', 'Climate Control'],
  },
  {
    id: '6',
    name: 'Ford Mustang',
    brand: 'Ford',
    model: 'Mustang',
    year: 2024,
    type: 'compact',
    seats: 4,
    transmission: 'automatic',
    fuelType: 'petrol',
    mileage: 0,
    pricePerDay: 75,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=400&fit=crop',
    available: true,
    location: 'Miami',
    features: ['Sports Handling', 'Premium Sound', 'Convertible Top'],
  },
  {
    id: '7',
    name: 'Toyota Hiace',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2024,
    type: 'suv',
    seats: 8,
    transmission: 'manual',
    fuelType: 'diesel',
    mileage: 0,
    pricePerDay: 60,
    image: 'https://images.unsplash.com/photo-1609708536965-6bacb5f6da7a?w=500&h=400&fit=crop',
    available: true,
    location: 'New York',
    features: ['Spacious Interior', 'AC', 'Power Steering'],
  },
  {
    id: '8',
    name: 'Audi A4',
    brand: 'Audi',
    model: 'A4',
    year: 2024,
    type: 'sedan',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'petrol',
    mileage: 0,
    pricePerDay: 95,
    image: 'https://images.unsplash.com/photo-1606611013016-969ce3a24121?w=500&h=400&fit=crop',
    available: true,
    location: 'Chicago',
    features: ['Quattro AWD', 'Leather Seats', 'Advanced Safety'],
  },
]

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    setVehicles(MOCK_VEHICLES)
    const storedBookings = localStorage.getItem('bookings')
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings))
      } catch (error) {
        console.error('Failed to load bookings:', error)
      }
    }
  }, [])

  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updatedBookings = [...bookings, newBooking]
    setBookings(updatedBookings)
    localStorage.setItem('bookings', JSON.stringify(updatedBookings))

    return newBooking.id
  }

  const getBookingsByUser = (userId: string) => {
    return bookings.filter((b) => b.userId === userId)
  }

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    )
    setBookings(updatedBookings)
    localStorage.setItem('bookings', JSON.stringify(updatedBookings))
  }

  const searchVehicles = (location: string, startDate: string, endDate: string) => {
    return vehicles.filter((v) => {
      const locationMatch = v.location.toLowerCase().includes(location.toLowerCase()) || location === ''
      const bookedDates = bookings.filter(
        (b) => b.vehicleId === v.id && b.status !== 'cancelled'
      )

      let isAvailable = true
      for (const booking of bookedDates) {
        const bookingStart = new Date(booking.startDate)
        const bookingEnd = new Date(booking.endDate)
        const searchStart = new Date(startDate)
        const searchEnd = new Date(endDate)

        if (
          (searchStart >= bookingStart && searchStart < bookingEnd) ||
          (searchEnd > bookingStart && searchEnd <= bookingEnd) ||
          (searchStart <= bookingStart && searchEnd >= bookingEnd)
        ) {
          isAvailable = false
          break
        }
      }

      return locationMatch && isAvailable
    })
  }

  return (
    <DataContext.Provider value={{ vehicles, bookings, addBooking, getBookingsByUser, cancelBooking, searchVehicles }}>
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
