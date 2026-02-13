'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  role: 'customer' | 'admin'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find((u: any) => u.email === email)

    if (!foundUser || foundUser.password !== password) {
      throw new Error('Invalid email or password')
    }

    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
    setIsLoggedIn(true)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
  }

  const signup = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    if (users.some((u: any) => u.email === userData.email)) {
      throw new Error('Email already exists')
    }

    const newUser: any = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    setIsLoggedIn(true)
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('currentUser')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))

      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData }
        localStorage.setItem('users', JSON.stringify(users))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
