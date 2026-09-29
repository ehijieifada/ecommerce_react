import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ForgotPassword = () => {
  const { requestPasswordReset } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const result = await requestPasswordReset(email);
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded shadow">
      <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
      <p className="mb-4 text-gray-600">Enter your account email and we’ll send a password reset link if an account exists.</p>
      {message && <p role="status" className="text-green-700 mb-4">{message}</p>}
      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-1" htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Enter your account email"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded cursor-pointer hover:bg-orange-700 transition disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-center">
        Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;