import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Load user and admin from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
  }, []);

  //  Signup Function (For Regular Users)
  const signup = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  //  Login Function (For Regular Users)
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("user", JSON.stringify({ username, token: data.token }));
      setUser({ username, token: data.token });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  //  Admin Login Function
  const adminLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Admin login failed");

      localStorage.setItem("admin", JSON.stringify({ email, token: data.token }));
      setAdmin({ email, token: data.token });

      return true;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  // Logout Function (Both User and Admin)
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, admin, signup, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
