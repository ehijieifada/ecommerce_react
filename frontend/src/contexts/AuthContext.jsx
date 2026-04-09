import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (response.ok && data.user) {
          if (data.user.isAdmin) {
            setAdmin({ email: data.user.email, isAdmin: true });
            setUser(null);
          } else {
            setUser({ email: data.user.email, isAdmin: false });
            setAdmin(null);
          }
        } else {
          setUser(null);
          setAdmin(null);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        setUser(null);
        setAdmin(null);
      }
    };

    fetchCurrentUser();
  }, [API_URL]);

  // ✅ USER SIGNUP
  const signup = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || "Signup failed" };
      }

      return { success: true, message: "User registered successfully" };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Signup failed due to network/server error" };
    }
  };

  // ✅ USER LOGIN
  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      setAdmin(null);
      setUser({ email: data.email, isAdmin: false });
      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed due to network/server error" };
    }
  };

  // ✅ ADMIN LOGIN
  const adminLogin = async (email, password) => {
    if (!email || !password) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Admin login failed:", data.message || "Unknown error");
        return false;
      }

      setUser(null);
      setAdmin({ email: data.email, isAdmin: true });
      return true;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  // ✅ ADMIN SIGNUP
  const adminSignup = async (email, password, signupToken) => {
    try {
      const body = { email, password };
      if (signupToken) body.token = signupToken;

      const response = await fetch(`${API_URL}/api/admin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin signup failed");
      }

      return true;
    } catch (error) {
      console.error("Admin signup error:", error);
      return false;
    }
  };

  // ✅ LOGOUT (clears session cookie and client state)
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        signup,
        login,
        adminLogin,
        adminSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};