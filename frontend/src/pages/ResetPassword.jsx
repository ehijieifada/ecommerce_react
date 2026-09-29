import React, { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ResetPassword = () => {
  const { resetPassword } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(token, password);
    if (result.success) {
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
      <h1 className="text-2xl font-bold mb-2">Choose a new password</h1>
      {!token && <p role="alert" className="text-red-600 mb-4">This reset link is invalid or incomplete.</p>}
      {message && <p role="status" className="text-green-700 mb-4">{message}</p>}
      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
      {!message && token && (
        <form onSubmit={handleSubmit}>
          <label className="block mb-1" htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <label className="block mb-1" htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-2 rounded cursor-pointer hover:bg-orange-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>
      )}
      {(message || !token) && (
        <p className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Go to login</Link>
        </p>
      )}
    </div>
  );
};

export default ResetPassword;