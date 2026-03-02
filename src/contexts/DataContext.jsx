import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const DataProvider = ({ children }) => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);


  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const getVehicleById = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  };

  const searchVehicles = (filters = {}) => {
    return vehicles.filter((vehicle) => {
      return (
        (!filters.city || vehicle.city === filters.city) &&
        (!filters.type || vehicle.type === filters.type) &&
        (!filters.minPrice || vehicle.price >= filters.minPrice) &&
        (!filters.maxPrice || vehicle.price <= filters.maxPrice)
      );
    });
  };

  const createBooking = async (vehicleId, startDate, endDate) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vehicleId, startDate, endDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await fetchMyBookings();
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    }
  };

  const fetchMyBookings = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/bookings/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMyBookings();
  }, [token]);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        bookings,
        getVehicleById,
        fetchVehicles,
        searchVehicles,
        createBooking,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);