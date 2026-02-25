import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('urbanride_user')
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem('urbanride_users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (!foundUser) {
      throw new Error('Invalid email or password')
    }

    setUser(foundUser)
    setIsLoggedIn(true)
    localStorage.setItem('urbanride_user', JSON.stringify(foundUser))
  }

  const signup = async (userData) => {
    const users = JSON.parse(localStorage.getItem('urbanride_users') || '[]')
    
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists')
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('urbanride_users', JSON.stringify(users))
    
    setUser(newUser)
    setIsLoggedIn(true)
    localStorage.setItem('urbanride_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('urbanride_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('urbanride_user', JSON.stringify(updated))
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
