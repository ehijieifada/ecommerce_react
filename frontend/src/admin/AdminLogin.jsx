import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const AdminLogin = () => {
  const { adminLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await adminLogin(email, password);
    if (success) {
      navigate("/admin");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        {/* Show signup link only if frontend explicitly enabled it via VITE_ADMIN_SIGNUP_ENABLED=true */}
        {import.meta.env.VITE_ADMIN_SIGNUP_ENABLED === "true" && (
          <div className="mt-3 text-sm">
            <span>Don't have an account? </span>
            <button type="button" onClick={() => navigate('/admin/signup')} className="text-blue-600 underline">Sign up</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
