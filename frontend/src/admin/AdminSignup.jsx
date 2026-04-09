import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const AdminSignup = () => {
  const { adminSignup } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please provide email and password");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

  setLoading(true);
  // If frontend has an invite token (only in your controlled deploy), include it in the request body.
  const signupToken = import.meta.env.VITE_ADMIN_SIGNUP_TOKEN || null;
  const success = await adminSignup(email, password, signupToken);
    setLoading(false);

    if (success) {
      alert("Admin registered successfully. Please login.");
      navigate("/admin/login");
    } else {
      alert("Signup failed. Check console for details.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Admin Signup</h2>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border p-2 w-full mb-3"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
};

export default AdminSignup;
