import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateCurrentUser,
  updateProfile
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

  const register = async (name, email , password , phoneNo) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser , {
        displayName : name
      })

      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ id:firebaseUser.uid , phone:phoneNo })
      });

      console.log("Response Status:",response.status);
      console.log("Response Text:",await response.text());

      console.log("Register User");
      console.log(firebaseUser);

      const userData = { uid: firebaseUser.uid, email: firebaseUser.email, name , phone : phoneNo};

      console.log("Register data");
      console.log(userData);

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

      console.log("Login User");
      console.log(firebaseUser);

      const response = await fetch(`${API_BASE}/auth/phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid:firebaseUser.uid})
      });
      const phoneData = await response.json();
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        phone : phoneData.phone
      };

      console.log("Login Data");
      console.log(userData);

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