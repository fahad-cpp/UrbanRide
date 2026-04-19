import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const DataProvider = ({ children }) => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, []);

  const getVehicleById = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vehicle");
      return await response.json();
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  }, []);

  const searchVehicles = useCallback((filters = {}) => {
    return vehicles.filter((vehicle) => (
      (!filters.city || vehicle.city === filters.city) &&
      (!filters.type || vehicle.type === filters.type) &&
      (!filters.minPrice || vehicle.price >= filters.minPrice) &&
      (!filters.maxPrice || vehicle.price <= filters.maxPrice)
    ));
  }, [vehicles]);

  const fetchMyBookings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [token]);

  const createBooking = useCallback(async (booking) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(booking),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchMyBookings();
      return data.id || data.bookingId;
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  }, [token, fetchMyBookings]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);
  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  const value = useMemo(() => ({
    vehicles, bookings, getVehicleById, fetchVehicles, searchVehicles, createBooking,
  }), [vehicles, bookings, getVehicleById, fetchVehicles, searchVehicles, createBooking]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);