import { createContext, useContext, useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  reload,
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

const AuthContext = createContext();
const API_BASE = "http://localhost:5000/api";

const app = await initializeApp(firebaseConfig);
const auth = await getAuth(app);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // Holds the raw Firebase user while waiting for email verification
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState(null);
  const pollRef = useRef(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // Poll Firebase every 4 seconds until email is verified, then auto-login
  const startVerificationPoll = (firebaseUser, phone) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        await reload(firebaseUser);
        if (firebaseUser.emailVerified) {
          clearInterval(pollRef.current);
          await finaliseLogin(firebaseUser, phone);
        }
      } catch (e) {
        console.error("Poll error:", e.message);
      }
    }, 4000);
  };

  // Shared login finalisation (called after verification confirmed)
  const finaliseLogin = async (firebaseUser, phone) => {
    const idToken = await firebaseUser.getIdToken(true);
    const role = firebaseUser.email === "admin@gmail.com" ? "admin" : "user";
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || "",
      phone,
      role,
    };

    setUser(userData);
    setToken(idToken);
    setPendingFirebaseUser(null);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", idToken);

    // Send welcome email now that they're verified (non-fatal)
    try {
      await fetch(`${API_BASE}/auth/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      });
    } catch (_) {}
  };

  const register = async (name, email, password, phoneNo) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const idToken = await firebaseUser.getIdToken(true);

      // Save phone & trigger verification email on backend
      await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id: firebaseUser.uid, phone: phoneNo }),
      });

      // Don't log in yet — show verify page & start polling
      setPendingFirebaseUser({ firebaseUser, phone: phoneNo });
      startVerificationPoll(firebaseUser, phoneNo);
    } catch (err) {
      console.error(err.message);
      throw new Error(err.message);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        // Fetch phone for if/when they verify
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE}/auth/phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ uid: firebaseUser.uid }),
        });
        const phoneData = await res.json();

        setPendingFirebaseUser({ firebaseUser, phone: phoneData.phone });
        startVerificationPoll(firebaseUser, phoneData.phone);
        return; // Caller sees no error; App shows VerifyEmailPage
      }

      const idToken = await firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE}/auth/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid: firebaseUser.uid }),
      });
      const phoneData = await res.json();
      await finaliseLogin(firebaseUser, phoneData.phone);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const logout = async () => {
    clearInterval(pollRef.current);
    await signOut(auth);
    setUser(null);
    setToken(null);
    setPendingFirebaseUser(null);
    localStorage.clear();
  };

  const cancelVerification = async () => {
    clearInterval(pollRef.current);
    // Sign out from Firebase but don't delete account
    await signOut(auth);
    setPendingFirebaseUser(null);
  };

  const updateUser = async ({ name, phone }) => {
    try {
      const currentToken = token || localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update profile");
      }
      if (auth.currentUser && name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
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
      const response = await fetch(`${API_BASE}/auth/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete account");
      }
      await signOut(auth);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      setUser(null);
      setToken(null);
      localStorage.clear();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoggedIn,
        pendingVerification: !!pendingFirebaseUser,
        pendingEmail: pendingFirebaseUser?.firebaseUser?.email || null,
        register, login, logout, cancelVerification,
        updateUser, deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
