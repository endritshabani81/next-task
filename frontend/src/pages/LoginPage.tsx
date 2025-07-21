import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { setAuthToken, isAuthenticated } from "../api/client";

const LoginPage = () => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!token.trim()) {
      setError("Please enter a valid token");
      setIsLoading(false);
      return;
    }

    try {
      setAuthToken(token.trim());

      const response = await fetch("http://localhost:8080/health", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      navigate("/products");
    } catch {
      setError("Invalid token. Please check your token and try again.");
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Product Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your authentication token to access the dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="label">
              Authentication Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              className="input"
              placeholder="Enter your authentication token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              💡 <strong>Hint:</strong> Use token "SECRET_TOKEN" for
              authentication
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
