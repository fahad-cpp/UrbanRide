import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateCurrentUser,
  updateProfile,
  deleteUser
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig"; 


const AuthContext = createContext();

const API_BASE = "http://localhost:5000/api";

const app = await initializeApp(firebaseConfig);
const auth = await getAuth(app);

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
      
      
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ id:firebaseUser.uid , phone:phoneNo })
      });
      const role = firebaseUser.email == "admin@gmail.com"?"admin":"user";
      const userData = { uid: firebaseUser.uid, email: firebaseUser.email, name , phone : phoneNo, role};

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

      const response = await fetch(`${API_BASE}/auth/phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid:firebaseUser.uid})
      });
      const phoneData = await response.json();
      const role = firebaseUser.email == "admin@gmail.com"?"admin":"user";
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        phone : phoneData.phone,
        role : role
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

  const updateUser = async ({ name, phone }) => {
    try {
      const currentToken = token || localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ name, phone })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update profile");
      }

      // Update Firebase Auth display name locally
      if (auth.currentUser && name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      // Update local state and storage
      const updatedUser = { ...user, name, phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const deleteAccount = async () => {
    try {
      const currentToken = token || localStorage.getItem("token");

      // Delete from backend (Firestore + Firebase Auth via Admin SDK)
      const response = await fetch(`${API_BASE}/auth/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete account");
      }

      // Sign out first to explicitly terminate the Firebase session,
      // then delete the account so the user is never left in a logged-in
      // state with an invalidated token.
      await signOut(auth);

      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // Clear local state
      setUser(null);
      setToken(null);
      localStorage.clear();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, register, login, logout, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);