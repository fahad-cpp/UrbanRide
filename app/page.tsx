'use client'

import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import Navigation from '@/components/Navigation'
import Home from '@/components/Home'

export default function Page() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Home />
        </div>
      </DataProvider>
    </AuthProvider>
  )
}
