import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig"; // Load config from file

// Create the Auth context
const AuthContext = createContext();

// Your backend API base URL
const API_BASE = "http://localhost:5000/api";

// Initialize Firebase app
console.log(firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // Firebase user info
  const [token, setToken] = useState(null); // Firebase ID token

  // Load user & token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // ---------- REGISTER ----------
  const register = async (name, email, password) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get ID token
      const idToken = await firebaseUser.getIdToken();

      // Call backend to save extra info (name) in Firestore
      await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ name, email })
      });

      // Save user info locally
      const userData = { uid: firebaseUser.uid, email: firebaseUser.email, name };
      setUser(userData);
      setToken(idToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", idToken);
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  };

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get ID token
      const idToken = await firebaseUser.getIdToken();

      // Save user info locally
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || ""
      };
      setUser(userData);
      setToken(idToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", idToken);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext in components
export const useAuth = () => useContext(AuthContext);