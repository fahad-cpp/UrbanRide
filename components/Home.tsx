'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { vehicles } = useData()
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      alert('Please login to search for cars')
      return
    }
    if (!startDate || !endDate || !location) {
      alert('Please fill in all fields')
      return
    }
    router.push(`/search?location=${location}&startDate=${startDate}&endDate=${endDate}`)
  }

  const featuredVehicles = vehicles.slice(0, 6)

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-cyan-500 to-primary text-white py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              Rent Your Perfect Car Today
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 text-balance">
              Simple, reliable, and affordable car rental services
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-card rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select location</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Miami">Miami</option>
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <SearchIcon size={20} />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground text-balance">
            Why Choose UrbanRide?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Easy Booking',
                description: 'Book your car in minutes with our simple and intuitive interface',
                icon: '🚗',
              },
              {
                title: 'Wide Selection',
                description: 'Choose from hundreds of vehicles in multiple categories',
                icon: '✨',
              },
              {
                title: 'Best Prices',
                description: 'Competitive rates with no hidden fees or surprise charges',
                icon: '💰',
              },
              {
                title: '24/7 Support',
                description: 'Our support team is always available to help you',
                icon: '📞',
              },
              {
                title: 'Safe & Secure',
                description: 'All vehicles are insured and regularly maintained',
                icon: '🛡️',
              },
              {
                title: 'Flexible Terms',
                description: 'Cancel or modify your booking up to 24 hours before',
                icon: '⏱️',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-8 shadow-md hover:shadow-lg transition border border-border"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-balance">
            Featured Vehicles
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Browse our popular vehicles and find the perfect match for your needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition border border-border"
              >
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${vehicle.pricePerDay}/day
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{vehicle.name}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">{vehicle.seats}</span> Seats
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{vehicle.transmission}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{vehicle.type}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{vehicle.fuelType}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {vehicle.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary text-xs text-foreground rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  {isLoggedIn ? (
                    <Link
                      href={`/vehicle/${vehicle.id}`}
                      className="w-full block text-center bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      View Details
                    </Link>
                  ) : (
                    <button className="w-full bg-muted text-muted-foreground py-2 rounded-lg cursor-not-allowed font-semibold">
                      Login to Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to Hit the Road?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers. Start your journey with UrbanRide today.
          </p>
          {!isLoggedIn && (
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Button
                onClick={() => (window as any).loginModal?.show?.()}
                className="bg-white text-primary hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Get Started
              </Button>
              <Link href="/demo">
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary px-8 py-3 text-lg"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">UrbanRide</h4>
              <p className="text-muted-foreground">Your trusted partner for modern car rentals</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 UrbanRide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
