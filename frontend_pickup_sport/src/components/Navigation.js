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
    setDarkMode(dm => !dm);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex align-items-center">

        {/* Brand on the left */}
        <Link to="/games" className="navbar-brand fw-bold fs-4">
          <span className="text-dark">Y</span>
          <span className="text-yale">-Pickup</span>
        </Link>

        {/* Right‐side group (always visible, no collapse) */}
        <div className="ms-auto d-flex align-items-center">

          {/* Dark‐mode toggle */}
          <button
            className="btn btn-link nav-link p-0 mx-2"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>

          {/* Profile dropdown */}
          <div className="dropdown mx-2">
            <button
              className="btn btn-link nav-link d-flex align-items-center p-0 dropdown-toggle"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="User profile menu"
            >
              <FaUserCircle size={20} className="me-1" />
              Profile
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userDropdown"
            >
              <li>
                <Link to="/profile" className="dropdown-item">
                  My Profile
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </li>
            </ul>
          </div>

          {/* New Game CTA */}
          <Link
            to="/create-game"
            className="btn btn-primary btn-sm d-flex align-items-center ms-3"
          >
            <FaPlus className="me-1" /> New Game
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
