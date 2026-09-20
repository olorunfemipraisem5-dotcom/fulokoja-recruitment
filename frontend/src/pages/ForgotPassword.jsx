import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    setDevResetUrl("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setStatus({ type: "success", text: data.message });
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-university-dark mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the email address on your account and we'll send you a link to reset your password.
        </p>

        {status.text && (
          <div
            className={`text-sm p-3 rounded mb-4 ${
              status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        )}

        {devResetUrl && (
          <div className="text-xs bg-amber-50 text-amber-800 p-3 rounded mb-4 break-all">
            <p className="font-medium mb-1">Development mode (no email service configured yet):</p>
            <Link to={devResetUrl.replace(window.location.origin, "")} className="underline">
              {devResetUrl}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-university-green"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-university-green text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Remembered your password?{" "}
          <Link to="/login" className="text-university-green font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
