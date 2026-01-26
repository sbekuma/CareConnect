import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Header.css";

function Header({ isLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setIsMenuOpen(false), [location]);

  return (
    <nav className="main-header">
      <div className="header-container">
        <Link to="/" className="logo-section">
          <div className="logo-box">
            <div className="logo-circle"></div>
          </div>
          <span className="logo-text">Care<span>Connect</span></span>
        </Link>

        <button 
          className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-overlay ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-menu">
            <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
            <li><Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About us</Link></li>
            {isLoggedIn ? (
              <>
                <li><Link to="/appointments">Appointments</Link></li>
                <li><Link to="/logout" className="logout-link">Logout</Link></li>
              </>
            ) : (
              <div className="auth-group">
                <li><Link to="/login" className="login-link">Login</Link></li>
                <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;