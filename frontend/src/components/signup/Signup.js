import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ENDPOINTS } from "../../apiConfig";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dob: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the ENDPOINTS helper which points to Render, not Vercel
      const response = await axios.post(ENDPOINTS.SIGNUP, formData);
      
      if (response.status === 201 || response.data.success) {
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <header className="signup-header">
            <div className="signup-logo-preview">
              <div className="logo-dot-inner"></div>
            </div>
            <h1>Create Account</h1>
            <p>Join CareConnect to manage your healthcare journey.</p>
          </header>

          <form onSubmit={handleSignup} className="signup-form">
            {error && <div className="error-message">⚠️ {error}</div>}
            
            <div className="form-input-group">
              <label>Full Name</label>
              <input 
                name="username" 
                placeholder="John Doe" 
                value={formData.username}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-input-group">
              <label>Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                value={formData.email}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-input-group">
              <label>Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-input-group">
              <label>Date of Birth</label>
              <input 
                name="dob" 
                type="date" 
                value={formData.dob}
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="signup-submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <footer className="signup-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Signup;