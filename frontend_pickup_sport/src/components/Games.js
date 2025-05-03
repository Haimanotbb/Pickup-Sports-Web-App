// src/components/Games.js

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaRegCheckCircle,
  FaPlayCircle,
  FaTimesCircle,
  FaSignInAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';
import { DateTime } from 'luxon';
import API from '../api/api';
import { SPORT_ICONS } from '../constants/sportIcons';
import '../index.css';

const INTERVAL = 7000;

const getOrdinal = n => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v > 10 && v < 14) ? 0 : (n % 10)] || "th";
};

const formatSexy = iso => {
  const dt = DateTime.fromISO(iso).setLocale("en");
  const day = dt.day;
  const suffix = getOrdinal(day);
  //use toFormat for parts, then concatenate
  return `${dt.toFormat("EEEE, LLLL d")}${suffix} at ${dt.toFormat("h:mm a")}`;
};

const statusMap = {
  open: {
    text: 'Open',
    class: 'bg-success',
    icon: <FaRegCheckCircle className="me-1" />
  },
  in_progress: {
    text: 'In Progress',
    class: 'bg-warning text-dark',
    icon: <FaPlayCircle className="me-1" />
  },
  cancelled: {
    text: 'Cancelled',
    class: 'bg-danger',
    icon: <FaTimesCircle className="me-1" />
  }
};

export default function Games() {
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('gamesCache');
    return saved ? JSON.parse(saved) : [];
  });
  const [filtered, setFiltered] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    sport: '',
    location: '',
    time: ''           // will hold 'YYYY-MM-DD'
  });
  const [participantQuery, setParticipantQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filterUserId, setFilterUserId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    API.get('profile/')
      .then(r => setUser(r.data))
      .catch(() => { });
    fetchGames();
    const tid = setInterval(fetchGames, INTERVAL);
    return () => clearInterval(tid);
  }, []);

  useEffect(() => {
    applyFilters(games);
  }, [games, filters, filterUserId]);

  async function fetchGames() {
    try {
      const { data } = await API.get('games/');
      setGames(data);
      localStorage.setItem('gamesCache', JSON.stringify(data));
      setError('');
    } catch {
      setError('Unable to load games.');
    }
  }

  function applyFilters(list) {
    const out = list.filter(g => {
      // name, sport, location filters
      if (filters.name &&
        !g.name.toLowerCase().includes(filters.name.toLowerCase())
      ) return false;
      if (filters.sport &&
        !g.sport.name.toLowerCase().includes(filters.sport.toLowerCase())
      ) return false;
      if (filters.location &&
        !g.location.toLowerCase().includes(filters.location.toLowerCase())
      ) return false;

      // DATE filter: exact match on YYYY-MM-DD
      if (filters.time) {
        const gameDate = DateTime.fromISO(g.start_time).toISODate();
        if (gameDate !== filters.time) return false;
      }

      // participant/creator filter
      if (filterUserId) {
        const isCreator = g.creator.id === filterUserId;
        const isParticipant = g.participants.some(p => p.user.id === filterUserId);
        if (!isCreator && !isParticipant) return false;
      }

      return true;
    });
    setFiltered(out);
  }

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleParticipantChange = async e => {
    const q = e.target.value;
    setParticipantQuery(q);
    setFilterUserId(null);
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const { data } = await API.get(`/users/?search=${encodeURIComponent(q)}`);
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleJoinLeave = async (game, join) => {
    try {
      await API.post(`games/${game.id}/${join ? 'join' : 'leave'}/`);
      fetchGames();
    } catch {
      alert(join ? 'Failed to join.' : 'Failed to leave.');
    }
  };
  const handleCancel = async g => { await API.post(`games/${g.id}/cancel/`); fetchGames(); };
  const handleDelete = async g => { await API.delete(`games/${g.id}/delete/`); fetchGames(); };

  return (
    <main className="container mt-5">
      <header className="mb-4">
        <h1 className="display-6">Find & Join a Game</h1>
        <p className="lead text-muted">Browse upcoming sports events in your area</p>
      </header>

      {/* Filters Form */}
      <form className="row g-3 mb-4">
        {/* Participant Search */}
        <div className="col" style={{ position: 'relative' }}>
          <label htmlFor="participantFilter" className="form-label text-secondary">
            Player
          </label>
          <input
            id="participantFilter"
            type="text"
            className="form-control"
            placeholder="Enter a player"
            value={participantQuery}
            onChange={handleParticipantChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          />
          <ul
            className={`dropdown-menu${showSuggestions ? ' show' : ''}`}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map(u => (
              <li key={u.id}>
                <button
                  type="button"
                  className="dropdown-item text-start"
                  onMouseDown={e => {
                    e.preventDefault();
                    setFilterUserId(u.id);
                    setParticipantQuery(u.name);
                    setShowSuggestions(false);
                  }}
                >
                  {u.name} &lt;{u.email}&gt;
                </button>
              </li>
            ))}
          </ul>
        </div>
        {['name', 'sport', 'location'].map((field, i) => (
          <div key={i} className="col">
            <label htmlFor={`${field}Filter`} className="form-label text-secondary">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={`${field}Filter`}
              name={field}
              type="text"
              className="form-control"
              placeholder={`Enter ${field}`}
              value={filters[field]}
              onChange={handleFilterChange}
            />
          </div>
        ))}
        <div className="col">
          <label htmlFor="timeFilter" className="form-label text-secondary">
            Date
          </label>
          <input
            id="timeFilter"
            name="time"
            type="date"
            className="form-control"
            value={filters.time}
            onChange={handleFilterChange}
          />
        </div>
      </form>

      {error && <div role="alert" className="alert alert-danger">{error}</div>}

      <div className="games-grid">
        {filtered.map(game => {
          const stateKey = game.current_state.toLowerCase();
          const info = statusMap[stateKey] || {};
          const isCreator = game.creator.id === user?.id;
          const joined = game.participants.some(p => p.user.id === user?.id);
          const full = game.capacity && game.participants.length >= game.capacity;
          const iconSrc = SPORT_ICONS[game.sport.name] || SPORT_ICONS.DEFAULT;

          return (
            <div key={game.id} className="card shadow mb-3">
              {game.image_url && (
                <img src={game.image_url}
                  alt={`${game.name} cover`}
                  className="card-img-top game-cover" />
              )}

              <Link to={`/games/${game.id}`} className="text-decoration-none text-reset">
                <div className="card-body d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title">{game.name}</h5>
                    <p className="card-text text-muted mb-1">{game.sport.name}</p>
                    <p className="card-text mb-2 text-muted">
                      <time dateTime={game.start_time}>
                        {formatSexy(game.start_time)}
                      </time>
                    </p>
                    <span className={`badge rounded-pill fw-semibold ${info.class}`}>
                      {info.icon}{info.text}
                    </span>
                  </div>
                  <img
                    src={iconSrc}
                    alt={game.sport.name}
                    className="ms-3"
                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                  />
                </div>
              </Link>

              <div className="card-footer d-flex justify-content-end">
                {isCreator ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-secondary" size="sm">⋮</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to={`/games/${game.id}/edit`}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleCancel(game)}>Cancel</Dropdown.Item>
                      <Dropdown.Item className="text-danger" onClick={() => handleDelete(game)}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : full ? (
                  <button className="btn btn-secondary" disabled title="Game full">Full</button>
                ) : joined ? (
                  <button className="btn btn-outline-danger" onClick={() => handleJoinLeave(game, false)}>
                    Leave <FaSignOutAlt className="ms-1" />
                  </button>
                ) : (
                  <button className="btn btn-primary"
                    disabled={game.current_state.toLowerCase() !== 'open'}
                    onClick={() => handleJoinLeave(game, true)}>
                    Join <FaSignInAlt className="ms-1" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-end mt-4">
        <Link to="/create-game" className="btn btn-success">
          + Create New Game
        </Link>
      </div>
    </main>
  );
}
