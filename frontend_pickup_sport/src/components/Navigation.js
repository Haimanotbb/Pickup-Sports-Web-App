// src/components/Navigation.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FaUserCircle, FaPlus, FaMoon, FaSun } from 'react-icons/fa';
import '../index.css';

const Navigation = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode((dm) => !dm);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex align-items-center">
        {/* Brand */}
        <Link to="/games" className="navbar-brand d-flex align-items-center">
          <span className="fw-bold fs-4 text-dark">Y</span>
          <span className="fw-bold fs-4 text-yale">-Pickup</span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible right-side menu */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav align-items-center ms-auto">
            {/* Dark Mode Toggle */}
            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link p-0"
                onClick={toggleDark}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
            </li>

            {/* Profile Dropdown */}
            <li className="nav-item dropdown mx-2">
              <a
                href="#"
                className="nav-link dropdown-toggle d-flex align-items-center"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="User profile menu"
              >
                <FaUserCircle size={20} className="me-1" />
                Profile
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                    aria-label="Log out of your account"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </li>

            {/* New Game – Pushed to the far right */}
            <li className="nav-item ms-auto">
              <Link
                to="/create-game"
                className="btn btn-primary btn-sm d-flex align-items-center"
              >
                <FaPlus className="me-1" /> New Game
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;