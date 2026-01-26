import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Clear user data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");

    // 2. Redirect after a short delay to show the "Logged Out" state
    const timer = setTimeout(() => {
      navigate("/");
      window.location.reload(); // Ensure header state refreshes
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="logout-page">
      <div className="logout-card">
        <div className="logout-icon-wrapper">
          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        
        <h1 className="logout-title">Successfully Logged Out</h1>
        <p className="logout-message">
          Thank you for using <strong>CareConnect</strong>. Your health is our priority. 
          We look forward to seeing you again.
        </p>
        
        <div className="redirect-status">
          <div className="progress-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Redirecting you to the homepage...</p>
        </div>

        <button className="manual-redirect-btn" onClick={() => navigate("/")}>
          Return Home Now
        </button>
      </div>
    </div>
  );
};

export default Logout;