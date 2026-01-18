import React from "react";
import { Link } from "react-router-dom";

// ===================== Add task 14 imports here ===================== 

function Header({ isLoggedIn }) {
  return (
    <nav className="main-header">
      <div className="logo-section">
        <Link to="/" className="logo-section">
          <span className="app-title">Care<span className="highlight">Connect</span></span>
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        {isLoggedIn ? (
          <>
            <li><Link to="/appointments">Show Appointments</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/logout">Logout</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Header;