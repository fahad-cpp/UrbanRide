'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { searchVehicles } = useData()
  const { isLoggedIn } = useAuth()

  const location = searchParams.get('location') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const [expandedFilters, setExpandedFilters] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<number>(200)
  const [selectedTransmission, setSelectedTransmission] = useState<string>('')

  const results = searchVehicles(location, startDate, endDate)

  const filteredResults = results.filter((vehicle) => {
    if (selectedType && vehicle.type !== selectedType) return false
    if (vehicle.pricePerDay > maxPrice) return false
    if (selectedTransmission && vehicle.transmission !== selectedTransmission) return false
    return true
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newLocation = (e.currentTarget.querySelector('[name="location"]') as HTMLSelectElement).value
    const newStartDate = (e.currentTarget.querySelector('[name="startDate"]') as HTMLInputElement).value
    const newEndDate = (e.currentTarget.querySelector('[name="endDate"]') as HTMLInputElement).value

    if (newStartDate && newEndDate) {
      router.push(`/search?location=${newLocation}&startDate=${newStartDate}&endDate=${newEndDate}`)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please login to search and book vehicles</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-card rounded-xl shadow-md p-6 mb-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <select
                  name="location"
                  defaultValue={location}
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input
                  type="date"
                  name="startDate"
                  defaultValue={startDate}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={endDate}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:col-span-2">
              Update Search
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div>
            <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="w-full flex items-center justify-between p-6 border-b border-border"
              >
                <h3 className="text-lg font-bold text-foreground">Filters</h3>
                {expandedFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {expandedFilters && (
                <div className="p-6 space-y-6">
                  {/* Vehicle Type */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Vehicle Type</h4>
                    <div className="space-y-2">
                      {['economy', 'compact', 'sedan', 'suv', 'luxury'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={selectedType === type}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-foreground capitalize">{type}</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value=""
                          checked={selectedType === ''}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-foreground">All Types</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Max Price per Day</h4>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="font-semibold text-foreground">${maxPrice}</span>
                    </div>
                  </div>

                  {/* Transmission */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Transmission</h4>
                    <div className="space-y-2">
                      {['automatic', 'manual'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="transmission"
                            value={type}
                            checked={selectedTransmission === type}
                            onChange={(e) => setSelectedTransmission(e.target.value)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-foreground capitalize">{type}</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transmission"
                          value=""
                          checked={selectedTransmission === ''}
                          onChange={(e) => setSelectedTransmission(e.target.value)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-foreground">All Types</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {filteredResults.length} Cars Available
              </h2>
            </div>

            {filteredResults.length === 0 ? (
              <div className="bg-card rounded-xl shadow-md p-12 text-center border border-border">
                <p className="text-xl text-muted-foreground mb-4">No vehicles found</p>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search dates
                </p>
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResults.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-card rounded-xl shadow-md overflow-hidden border border-border hover:shadow-lg transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{vehicle.name}</h3>
                          <p className="text-muted-foreground">
                            {vehicle.year} • {vehicle.brand} {vehicle.model}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-semibold text-foreground">{vehicle.seats}</span>{' '}
                            <span className="text-muted-foreground">Passengers</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              {vehicle.transmission}
                            </span>{' '}
                            <span className="text-muted-foreground">Transmission</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              {vehicle.fuelType}
                            </span>{' '}
                            <span className="text-muted-foreground">Fuel</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{vehicle.type}</span>{' '}
                            <span className="text-muted-foreground">Type</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {vehicle.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-secondary text-sm text-foreground rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing & Action */}
                      <div className="md:col-span-1 flex flex-col justify-between items-end">
                        <div className="text-right mb-4">
                          <div className="text-3xl font-bold text-primary">
                            ${vehicle.pricePerDay}
                          </div>
                          <p className="text-muted-foreground">per day</p>
                          {startDate && endDate && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Total: $
                              {Math.ceil(
                                (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              ) * vehicle.pricePerDay}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/vehicle/${vehicle.id}?startDate=${startDate}&endDate=${endDate}`}
                          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
