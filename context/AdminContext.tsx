'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Vehicle } from './DataContext'

interface AdminContextType {
  vehicles: Vehicle[]
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => string
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  toggleAvailability: (id: string) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const storedVehicles = localStorage.getItem('adminVehicles')
    if (storedVehicles) {
      try {
        setVehicles(JSON.parse(storedVehicles))
      } catch (error) {
        console.error('Failed to load admin vehicles:', error)
      }
    }
  }, [])

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
    }
    const updated = [...vehicles, newVehicle]
    setVehicles(updated)
    localStorage.setItem('adminVehicles', JSON.stringify(updated))
    return newVehicle.id
  }

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    const updated = vehicles.map((v) =>
      v.id === id ? { ...v, ...vehicleData } : v
    )
    setVehicles(updated)
    localStorage.setItem('adminVehicles', JSON.stringify(updated))
  }

  const deleteVehicle = (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id)
    setVehicles(updated)
    localStorage.setItem('adminVehicles', JSON.stringify(updated))
  }

  const toggleAvailability = (id: string) => {
    const updated = vehicles.map((v) =>
      v.id === id ? { ...v, available: !v.available } : v
    )
    setVehicles(updated)
    localStorage.setItem('adminVehicles', JSON.stringify(updated))
  }

  return (
    <AdminContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle, toggleAvailability }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
