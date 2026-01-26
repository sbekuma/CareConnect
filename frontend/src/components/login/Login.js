import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ENDPOINTS } from "../../apiConfig";
import "./Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the live endpoint instead of localhost
      const res = await axios.post(ENDPOINTS.LOGIN, formData);
      
      if (res.data.success) {
        // Store auth data in localStorage
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("isLoggedIn", "true");
        
        setIsLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <header className="login-header">
            <div className="login-logo-preview">
              <div className="logo-dot-inner"></div>
            </div>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your CareConnect account.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" title="Coming soon" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <span className="loader-small"></span> : "Sign In to Account"}
            </button>
          </form>

          <footer className="login-footer">
            <p>
              Don't have an account? <Link to="/signup">Create an account</Link>
            </p>
          </footer>
        </div>
        
        <div className="login-help-text">
          <p>By signing in, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;