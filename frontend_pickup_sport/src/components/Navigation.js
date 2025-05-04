import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FaUserCircle, FaPlus, FaMoon, FaSun } from 'react-icons/fa';
import '../index.css';

const Navigation = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(dm => {
      document.body.classList.toggle('dark-mode', !dm);
      return !dm;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex align-items-center">
        <Link to="/games" className="navbar-brand fw-bold fs-4">
          <span className="text-dark">Y</span>
          <span className="text-yale">-Pickup</span>
        </Link>
        <div className="ms-auto d-flex align-items-center">
          <button
            className="btn btn-link nav-link p-0 me-2 dark-toggle text-yale"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            style={{ position: 'relative', top: '-2px' }}
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          <div className="dropdown mx-2">
            <button
              className="btn btn-link nav-link d-flex align-items-center p-0 dropdown-toggle text-yale"
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
          <Link
            to="/create-game"
            className="btn btn-primary btn-sm d-flex align-items-center ms-3"
          >
            <FaPlus className="me-1" /> New Game
          </Link>
        </div>
      </div>
    </nav >
  );
};

export default Navigation;