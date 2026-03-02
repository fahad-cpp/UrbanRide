import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig"; 


const AuthContext = createContext();

const API_BASE = "http://localhost:5000/api";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const register = async (name, email, password) => {
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const idToken = await firebaseUser.getIdToken();

      await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ name, email })
      });

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

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const idToken = await firebaseUser.getIdToken();

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

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token,isLoggedIn, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);