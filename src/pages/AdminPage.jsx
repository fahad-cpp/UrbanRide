import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import '../styles/admin-dashboard.css'

const API_BASE = "http://localhost:5000/api";

function AdminPage() {
  const { token } = useAuth();

  const [vehicles, setVehicles]                   = useState([]);
  const [vehiclePage, setVehiclePage]             = useState(1);
  const [vehiclePagination, setVehiclePagination] = useState(null);
  const [vehiclesLoading, setVehiclesLoading]     = useState(false);

  const [bookings, setBookings]           = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [selectedTab, setSelectedTab]       = useState("overview");
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage]     = useState("");

  const [formData, setFormData] = useState({
    name: "", brand: "", type: "Electric", seats: 5,
    transmission: "automatic", fuelType: "petrol", pricePerDay: 50, image: ""
  });

  const flash = (type, msg) => {
    if (type === "success") { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 3000); }
    else                    { setErrorMessage(msg);   setTimeout(() => setErrorMessage(""), 4000);   }
  };

  const fetchVehicles = useCallback(async (page = 1) => {
    setVehiclesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/vehicles/paginated?page=${page}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data.vehicles || []);
      setVehiclePagination(data.pagination || null);
    } catch (err) {
      console.error(err);
      flash("error", "Failed to load vehicles.");
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      setBookings(await res.json());
    } catch (err) {
      console.error(err);
      flash("error", "Failed to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchVehicles(vehiclePage); }, [fetchVehicles, vehiclePage]);
  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) { flash("error", "Failed to add vehicle."); return; }
      flash("success", "Vehicle added successfully!");
      setShowAddVehicle(false);
      setFormData({ name: "", brand: "", type: "Electric", seats: 5, transmission: "automatic", fuelType: "petrol", pricePerDay: 50, image: "" });
      fetchVehicles(vehiclePage);
    } catch (err) {
      console.error(err);
      flash("error", "An error occurred.");
    }
  };

  const deleteVehicle = async (id) => {
    if (!token || !window.confirm("Delete this vehicle?")) return;
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { flash("success", "Vehicle deleted."); fetchVehicles(vehiclePage); }
      else flash("error", "Failed to delete vehicle.");
    } catch (err) {
      console.error(err);
      flash("error", "Failed to delete vehicle.");
    }
  };

  const confirmBooking = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "confirmed" })
      });
      if (res.ok) {
        flash("success", "Booking confirmed!");
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
      } else {
        flash("error", "Failed to confirm booking.");
      }
    } catch (err) {
      console.error(err);
      flash("error", "Failed to confirm booking.");
    }
  };

  const deleteBooking = async (id) => {
    if (!token || !window.confirm("Delete this booking? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        flash("success", "Booking deleted.");
        setBookings(prev => prev.filter(b => b.id !== id));
      } else {
        flash("error", "Failed to delete booking.");
      }
    } catch (err) {
      console.error(err);
      flash("error", "Failed to delete booking.");
    }
  };

  const totalVehicles     = vehiclePagination?.total ?? vehicles.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookings   = bookings.filter(b => b.status === "pending").length;
  const totalRevenue      = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings     = bookings.length;
  const avgBookingValue   = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;

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
          <span className="alert-icon">✓</span>
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error">
          <span className="alert-icon">✕</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="admin-nav">
        {["overview", "vehicles", "bookings"].map(tab => (
          <button
            key={tab}
            className={"nav-button" + (selectedTab === tab ? " active" : "")}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
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
          </div>
        )}

        {selectedTab === "vehicles" && (
          <div className="tab-content">
            <div className="vehicles-header">
              <h2>Fleet Management</h2>
              <button
                className={"btn-add-vehicle" + (showAddVehicle ? " active" : "")}
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
                    <input id="name" type="text" placeholder="e.g., Corolla 2022"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <input id="brand" type="text" placeholder="e.g., Toyota"
                      value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="type">Vehicle Type *</label>
                    <select id="type" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                      <option value="Electric">Electric</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Luxury">Luxury</option>
                      <option value="MPV">MPV</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="seats">Seats *</label>
                    <input id="seats" type="number" min="1" max="8"
                      value={formData.seats}
                      onChange={e => setFormData({ ...formData, seats: e.target.value === '' ? '' : parseInt(e.target.value) || 1 })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transmission">Transmission *</label>
                    <select id="transmission" value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })} required>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fuelType">Fuel Type *</label>
                    <select id="fuelType" value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })} required>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
                    <input id="pricePerDay" type="number" min="0" step="1" placeholder="e.g., 2500"
                      value={formData.pricePerDay}
                      onChange={e => setFormData({ ...formData, pricePerDay: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="form-group form-full">
                    <label htmlFor="image">Image URL *</label>
                    <input id="image" type="url" placeholder="https://example.com/car.jpg"
                      value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="btn-submit">
                  <span className="btn-icon">+</span> Add Vehicle
                </button>
              </form>
            )}

            {vehiclesLoading ? (
              <div className="loading-state"><div className="spinner"></div><p>Loading vehicles...</p></div>
            ) : vehicles.length > 0 ? (
              <>
                <div className="vehicles-list">
                  <div className="vehicles-table">
                    <div className="table-header">
                      <div className="col-name">Vehicle</div>
                      <div className="col-type">Type</div>
                      <div className="col-specs">Specs</div>
                      <div className="col-price">Price/Day</div>
                      <div className="col-action">Action</div>
                    </div>
                    {vehicles.map(vehicle => (
                      <div key={vehicle.id} className="table-row">
                        <div className="col-name">
                          <div className="vehicle-info">
                            {vehicle.image && <img src={vehicle.image} alt={vehicle.name} className="vehicle-thumb" />}
                            <div>
                              <p className="vehicle-brand">{vehicle.brand}</p>
                              <p className="vehicle-model">{vehicle.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-type"><span className="type-badge">{vehicle.type}</span></div>
                        <div className="col-specs">
                          <span className="spec-badge">{vehicle.seats} Seats</span>
                          <span className="spec-badge">{vehicle.transmission}</span>
                        </div>
                        <div className="col-price"><span className="price-text">₹{vehicle.pricePerDay}</span></div>
                        <div className="col-action">
                          <button className="btn-delete" onClick={() => deleteVehicle(vehicle.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {vehiclePagination && vehiclePagination.pages > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn-delete"
                      onClick={() => setVehiclePage(p => Math.max(1, p - 1))}
                      disabled={vehiclePage === 1}
                      style={{ opacity: vehiclePage === 1 ? 0.4 : 1 }}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: vehiclePagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setVehiclePage(p)}
                        className={vehiclePage === p ? "btn-submit" : "btn-delete"}
                        style={{ minWidth: '2.5rem', padding: '0.4rem 0.75rem' }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="btn-delete"
                      onClick={() => setVehiclePage(p => Math.min(vehiclePagination.pages, p + 1))}
                      disabled={vehiclePage === vehiclePagination.pages}
                      style={{ opacity: vehiclePage === vehiclePagination.pages ? 0.4 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">-</div>
                <p>No vehicles in fleet</p>
                <p className="empty-hint">Add your first vehicle to get started</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === "bookings" && (
          <div className="tab-content">
            <h2>Booking Management</h2>
            {bookingsLoading ? (
              <div className="loading-state"><div className="spinner"></div><p>Loading bookings...</p></div>
            ) : bookings.length > 0 ? (
              <div className="bookings-table">
                <div className="table-header">
                  <div className="col-customer">Customer</div>
                  <div className="col-vehicle">Vehicle</div>
                  <div className="col-dates">Dates</div>
                  <div className="col-status">Status</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-action">Actions</div>
                </div>
                {bookings.map(booking => (
                  <div key={booking.id} className="table-row">
                    <div className="col-customer">
                      <p className="booking-customer">{booking.userName || booking.userId?.slice(0, 8) || "N/A"}</p>
                    </div>
                    <div className="col-vehicle">
                      <p className="booking-vehicle">{booking.vehicleName || booking.vehicleId?.slice(0, 8) || "N/A"}</p>
                    </div>
                    <div className="col-dates">
                      <p className="booking-date">
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "?"} -{" "}
                        {booking.endDate   ? new Date(booking.endDate).toLocaleDateString()   : "?"}
                      </p>
                    </div>
                    <div className="col-status">
                      <span className={"status-badge status-" + booking.status}>{booking.status}</span>
                    </div>
                    <div className="col-amount">
                      <p className="booking-amount">₹{booking.totalPrice || "0"}</p>
                    </div>
                    <div className="col-action" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {booking.status !== "confirmed" && (
                        <button
                          className="btn-submit"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => confirmBooking(booking.id)}
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => deleteBooking(booking.id)}
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