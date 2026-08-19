import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-2 10H7v-2h10v2zm0-4H7V8h10v2z"/>
            </svg>
          </div>
          <span className="brand-title">SyncMeeting</span>
        </Link>

        {isAuthenticated && currentUser && (
          <div className="navbar-user">
            <div className="user-profile">
              <div className="avatar-circle">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-email">{currentUser.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
