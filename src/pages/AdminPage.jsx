import { useState, useEffect, useCallback } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:5000/api";

function AdminPage() {
  const { vehicles, fetchVehicles } = useData();
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "sedan",
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol",
    pricePerDay: 50,
    image: ""
  });


  const fetchBookings = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/bookings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error("Failed to fetch bookings");
        return;
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        console.error("Failed to add vehicle");
        return;
      }

      await fetchVehicles();

      setShowAddVehicle(false);
      setFormData({
        name: "",
        type: "sedan",
        seats: 5,
        transmission: "automatic",
        fuelType: "petrol",
        pricePerDay: 50,
        image: ""
      });

    } catch (err) {
      console.error(err);
    }
  };

  const deleteVehicle = async (id) => {
    if (!token) return;

    try {
      await fetch(`${API_BASE}/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const totalVehicles = vehicles?.length || 0;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings = bookings.length;

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
          <form
            onSubmit={handleAddVehicle}
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 400
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Vehicle Name</label>
              <input
                type="text"
                placeholder="e.g., Toyota Corolla 2022"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Vehicle Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="">Select type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Number of Seats</label>
              <input
                type="number"
                placeholder="e.g., 5"
                min="1"
                value={formData.seats}
                onChange={(e) =>
                  setFormData({ ...formData, seats: Number(e.target.value) })
                }
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) =>
                  setFormData({ ...formData, transmission: e.target.value })
                }
                required
              >
                <option value="">Select transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value })
                }
                required
              >
                <option value="">Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Price Per Day (USD)</label>
              <input
                type="number"
                placeholder="e.g., 75"
                min="0"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerDay: Number(e.target.value)
                  })
                }
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Vehicle Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/car.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
              />
            </div>

            <button type="submit">Add Vehicle</button>
          </form>
        )}

          {vehicles?.map((vehicle) => (
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

      {loading && <p>Loading...</p>}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setSelectedTab("overview")}>
          Overview
        </button>
        <button onClick={() => setSelectedTab("vehicles")}>
          Vehicles
        </button>
      </div>
    </div>
  );
}

export default AdminPage;