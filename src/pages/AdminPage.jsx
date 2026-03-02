import { useState, useEffect } from "react"
import { useData } from "../contexts/DataContext"
import { useAuth } from "../contexts/AuthContext"

const API_BASE = "http://localhost:5000/api"

function AdminPage() {
  const { vehicles, fetchVehicles } = useData()
  const { token } = useAuth()

  const [bookings, setBookings] = useState([])
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "sedan",
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol",
    pricePerDay: 50,
    image: ""
  })

  const fetchBookings = async () => {
    const res = await fetch(`${API_BASE}/bookings/admin`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) return
    const data = await res.json()
    setBookings(data)
  }

  useEffect(() => {
    if (token) fetchBookings()
  }, [token])


  const handleAddVehicle = async (e) => {
    e.preventDefault()

    const res = await fetch(`${API_BASE}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      fetchVehicles()
      setShowAddVehicle(false)
      setFormData({
        name: "",
        type: "sedan",
        seats: 5,
        transmission: "automatic",
        fuelType: "petrol",
        pricePerDay: 50,
        image: ""
      })
    }
  }


  const deleteVehicle = async (id) => {
    await fetch(`${API_BASE}/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    fetchVehicles()
  }

  const totalVehicles = vehicles.length
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const totalBookings = bookings.length

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>

      {selectedTab === "overview" && (
        <>
          <p>Total Vehicles: {totalVehicles}</p>
          <p>Active Bookings: {confirmedBookings}</p>
          <p>Total Revenue: ${totalRevenue}</p>
          <p>Total Bookings: {totalBookings}</p>
        </>
      )}

      {selectedTab === "vehicles" && (
        <>
          <button onClick={() => setShowAddVehicle(!showAddVehicle)}>
            {showAddVehicle ? "Cancel" : "Add Vehicle"}
          </button>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle}>
              <input
                type="text"
                placeholder="Vehicle Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Price Per Day"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerDay: Number(e.target.value)
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />

              <button type="submit">Add</button>
            </form>
          )}

          {vehicles.map((vehicle) => (
            <div key={vehicle.id} style={{ marginTop: 10 }}>
              <p>
                {vehicle.name} - ${vehicle.pricePerDay}/day
              </p>
              <button onClick={() => deleteVehicle(vehicle.id)}>
                Delete
              </button>
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setSelectedTab("overview")}>
          Overview
        </button>
        <button onClick={() => setSelectedTab("vehicles")}>
          Vehicles
        </button>
      </div>
    </div>
  )
}

export default AdminPage