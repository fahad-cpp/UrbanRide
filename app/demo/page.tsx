'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupStep, setSetupStep] = useState<'idle' | 'loading' | 'complete'>('idle')

  const initializeDemo = () => {
    setSetupStep('loading')

    // Create demo users
    const demoUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, New York, NY 10001',
        licenseNumber: 'DL-2024-001',
        role: 'customer',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'test2@example.com',
        password: 'password123',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Avenue, Los Angeles, CA 90001',
        licenseNumber: 'DL-2024-002',
        role: 'customer',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '+1 (555) 456-7890',
        address: '789 Admin Street, Chicago, IL 60601',
        licenseNumber: 'DL-ADMIN-001',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem('users', JSON.stringify(demoUsers))

    // Initialize empty bookings and emails
    localStorage.setItem('bookings', JSON.stringify([]))
    localStorage.setItem('emailHistory', JSON.stringify([]))

    // Mark demo as initialized
    localStorage.setItem('demoInitialized', 'true')

    setTimeout(() => {
      setSetupStep('complete')
      setSetupComplete(true)
    }, 1500)
  }

  useEffect(() => {
    const isInitialized = localStorage.getItem('demoInitialized')
    if (isInitialized) {
      setSetupComplete(true)
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
            UrbanRide Demo Environment
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Welcome to the UrbanRide car rental platform demo. This is a fully functional frontend application
            showcasing all features including search, booking, payments, and admin management.
          </p>

          {/* Features List */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Included:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Car search by location and date',
                'Vehicle listing with detailed specs',
                'Complete booking flow',
                'Payment processing simulation',
                'User authentication system',
                'Profile management',
                'Booking history tracking',
                'Admin dashboard',
                'Fleet management panel',
                'Email confirmation system',
                'Booking cancellation',
                'Real-time availability checking',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mb-12 bg-secondary rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Demo Credentials:</h2>

            <div className="space-y-6">
              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Customer Account</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <code className="bg-muted px-2 py-1 rounded text-foreground font-mono">test@example.com</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Password:</span>{' '}
                    <code className="bg-muted px-2 py-1 rounded text-foreground font-mono">password123</code>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Admin Account</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <code className="bg-muted px-2 py-1 rounded text-foreground font-mono">admin@example.com</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Password:</span>{' '}
                    <code className="bg-muted px-2 py-1 rounded text-foreground font-mono">admin123</code>
                  </div>
                </div>
              </div>

              <div className="bg-secondary border border-border rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-primary flex-shrink-0" size={20} />
                <p className="text-sm text-foreground">
                  Demo credentials are reset if you clear browser storage. Click initialize below to recreate them.
                </p>
              </div>
            </div>
          </div>

          {/* Initialize Button */}
          <div className="mb-12">
            <div className="flex gap-4 flex-col sm:flex-row">
              {!setupComplete ? (
                <Button
                  onClick={initializeDemo}
                  disabled={setupStep !== 'idle'}
                  className="sm:w-auto"
                >
                  {setupStep === 'loading' ? 'Initializing Demo Data...' : 'Initialize Demo Data'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={20} />
                  <span className="font-semibold">Demo initialized successfully!</span>
                </div>
              )}
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="sm:w-auto"
              >
                Go to Home
              </Button>
            </div>
          </div>

          {/* Getting Started Guide */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Getting Started:</h2>
            <ol className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Sign Up or Login',
                  description: 'Create a new account or use the demo credentials provided above.',
                },
                {
                  step: '2',
                  title: 'Search for Vehicles',
                  description: 'Go to the search page and filter cars by location, date, type, and price.',
                },
                {
                  step: '3',
                  title: 'View Details & Book',
                  description: 'Click on a vehicle to see full details, then proceed with the booking.',
                },
                {
                  step: '4',
                  title: 'Process Payment',
                  description:
                    'Complete the payment process. Use any card number for testing (e.g., 4111 1111 1111 1111).',
                },
                {
                  step: '5',
                  title: 'Receive Confirmation',
                  description: 'Get a booking confirmation with details. Check your profile for booking history.',
                },
                {
                  step: '6',
                  title: 'Admin Dashboard',
                  description: 'Login with admin credentials to manage fleet, view bookings, and email history.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}
