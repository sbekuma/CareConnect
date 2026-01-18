import React from 'react';
import './Logout.css';

function Logout() {
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  return (
    <div className="logout">
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Logout;
