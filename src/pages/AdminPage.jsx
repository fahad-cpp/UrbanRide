import { useState, useEffect, useCallback } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import '../styles/admin-dashboard.css'

const API_BASE = "http://localhost:5000/api";

function AdminPage() {
  const { vehicles, fetchVehicles } = useData();
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
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
        setErrorMessage("Failed to add vehicle. Please try again.");
        return;
      }

      await fetchVehicles();
      setSuccessMessage("Vehicle added successfully!");

      setShowAddVehicle(false);
      setFormData({
        name: "",
        brand: "",
        type: "sedan",
        seats: 5,
        transmission: "automatic",
        fuelType: "petrol",
        pricePerDay: 50,
        image: ""
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const deleteVehicle = async (id) => {
    if (!token || !window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        await fetchVehicles();
        setSuccessMessage("Vehicle deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete vehicle.");
    }
  };

  const totalVehicles = vehicles?.length || 0;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings = bookings.length;
  const avgBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage vehicles, bookings, and revenue</p>
          </div>
          <div className="header-badge">
            <span className="badge-icon">⚙</span>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">Success</span>
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error">
          <span className="alert-icon">Error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="admin-nav">
        <button
          className={`nav-button ${selectedTab === "overview" ? "active" : ""}`}
          onClick={() => setSelectedTab("overview")}
        >
          <span className="nav-icon">Chart</span>
          Overview
        </button>
        <button
          className={`nav-button ${selectedTab === "vehicles" ? "active" : ""}`}
          onClick={() => setSelectedTab("vehicles")}
        >
          <span className="nav-icon">Car</span>
          Vehicles
        </button>
        <button
          className={`nav-button ${selectedTab === "bookings" ? "active" : ""}`}
          onClick={() => setSelectedTab("bookings")}
        >
          <span className="nav-icon">List</span>
          Bookings
        </button>
      </div>

      <div className="admin-container">
        {selectedTab === "overview" && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card stat-vehicles">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Total Vehicles</p>
                  <p className="stat-value">{totalVehicles}</p>
                </div>
              </div>

              <div className="stat-card stat-bookings">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Confirmed Bookings</p>
                  <p className="stat-value">{confirmedBookings}</p>
                </div>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Pending Bookings</p>
                  <p className="stat-value">{pendingBookings}</p>
                </div>
              </div>

              <div className="stat-card stat-revenue">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value">₹{totalRevenue.toFixed(0)}</p>
                </div>
              </div>

              <div className="stat-card stat-total">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Total Bookings</p>
                  <p className="stat-value">{totalBookings}</p>
                </div>
              </div>

              <div className="stat-card stat-average">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <p className="stat-label">Avg Booking Value</p>
                  <p className="stat-value">₹{avgBookingValue}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : null}
          </div>
        )}

        {selectedTab === "vehicles" && (
          <div className="tab-content">
            <div className="vehicles-header">
              <h2>Fleet Management</h2>
              <button 
                className={`btn-add-vehicle ${showAddVehicle ? "active" : ""}`}
                onClick={() => setShowAddVehicle(!showAddVehicle)}
              >
                <span className="btn-icon">+</span>
                {showAddVehicle ? "Cancel" : "Add Vehicle"}
              </button>
            </div>

            {showAddVehicle && (
              <form className="add-vehicle-form" onSubmit={handleAddVehicle}>
                <h3 className="form-title">Add New Vehicle</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Vehicle Name *</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g., Corolla 2022"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <input
                      id="brand"
                      type="text"
                      placeholder="e.g., Toyota"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Vehicle Type *</label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="seats">Number of Seats *</label>
                    <input
                      id="seats"
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      max="8"
                      value={formData.seats}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          seats: e.target.value === '' ? '' : parseInt(e.target.value) || 1
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="transmission">Transmission *</label>
                    <select
                      id="transmission"
                      value={formData.transmission}
                      onChange={(e) =>
                        setFormData({ ...formData, transmission: e.target.value })
                      }
                      required
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fuelType">Fuel Type *</label>
                    <select
                      id="fuelType"
                      value={formData.fuelType}
                      onChange={(e) =>
                        setFormData({ ...formData, fuelType: e.target.value })
                      }
                      required
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
                    <input
                      id="pricePerDay"
                      type="number"
                      placeholder="e.g., 2500"
                      min="0"
                      step="1"
                      value={formData.pricePerDay}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          pricePerDay: e.target.value === '' ? '' : parseInt(e.target.value) || 0
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group form-full">
                    <label htmlFor="image">Vehicle Image URL *</label>
                    <input
                      id="image"
                      type="url"
                      placeholder="https://example.com/car.jpg"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  <span className="btn-icon">+</span>
                  Add Vehicle
                </button>
              </form>
            )}

            <div className="vehicles-list">
              {vehicles && vehicles.length > 0 ? (
                <div className="vehicles-table">
                  <div className="table-header">
                    <div className="col-name">Vehicle</div>
                    <div className="col-type">Type</div>
                    <div className="col-specs">Specifications</div>
                    <div className="col-price">Price/Day</div>
                    <div className="col-action">Action</div>
                  </div>
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="table-row">
                      <div className="col-name">
                        <div className="vehicle-info">
                          {vehicle.image && (
                            <img src={vehicle.image} alt={vehicle.name} className="vehicle-thumb" />
                          )}
                          <div>
                            <p className="vehicle-brand">{vehicle.brand}</p>
                            <p className="vehicle-model">{vehicle.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-type">
                        <span className="type-badge">{vehicle.type}</span>
                      </div>
                      <div className="col-specs">
                        <span className="spec-badge">{vehicle.seats} Seats</span>
                        <span className="spec-badge">{vehicle.transmission}</span>
                      </div>
                      <div className="col-price">
                        <span className="price-text">₹{vehicle.pricePerDay}</span>
                      </div>
                      <div className="col-action">
                        <button
                          className="btn-delete"
                          onClick={() => deleteVehicle(vehicle.id)}
                          title="Delete vehicle"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">-</div>
                  <p>No vehicles in fleet</p>
                  <p className="empty-hint">Add your first vehicle to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "bookings" && (
          <div className="tab-content">
            <h2>Booking Management</h2>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="bookings-table">
                <div className="table-header">
                  <div className="col-customer">Customer</div>
                  <div className="col-vehicle">Vehicle</div>
                  <div className="col-dates">Dates</div>
                  <div className="col-status">Status</div>
                  <div className="col-amount">Amount</div>
                </div>
                {bookings.map((booking) => (
                  <div key={booking.id} className="table-row">
                    <div className="col-customer">
                      <p className="booking-customer">{booking.userName || "N/A"}</p>
                    </div>
                    <div className="col-vehicle">
                      <p className="booking-vehicle">{booking.vehicleName || "N/A"}</p>
                    </div>
                    <div className="col-dates">
                      <p className="booking-date">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-status">
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="col-amount">
                      <p className="booking-amount">₹{booking.totalPrice || "0"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">-</div>
                <p>No bookings yet</p>
                <p className="empty-hint">Bookings will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;