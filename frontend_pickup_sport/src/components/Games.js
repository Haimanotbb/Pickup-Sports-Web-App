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
const formatSexy = iso =>
  DateTime.fromISO(iso)
    .setLocale('en')
    .toFormat("EEEE, LLLL d'th' 'at' h:mm a");

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
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ sport: '', location: '', time: '', name: ''});
  const navigate = useNavigate();

  useEffect(() => {
    API.get('profile/').then(r => setUser(r.data)).catch(() => { });
    fetchGames();
    const id = setInterval(fetchGames, INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Apply filters whenever games or filters change
  useEffect(() => {
    applyFilters(games);
  }, [games, filters]);

  async function fetchGames() {
    try {
      const { data } = await API.get('games/');
      setGames(data);
      setError('');
    } catch {
      setError('Unable to load games.');
    }
  }

  function applyFilters(list) {
    const out = list.filter(g =>
      (!filters.sport || g.sport.name.toLowerCase().includes(filters.sport.toLowerCase())) &&
      (!filters.location || g.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.time || formatSexy(g.start_time).toLowerCase().includes(filters.time.toLowerCase())) &&
      (!filters.name || g.name.toLowerCase().includes(filters.name.toLowerCase()))
    );
    setFiltered(out);
  }

  const handleFilterChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleJoinLeave = async (game, join) => {
    try {
      await API.post(`games/${game.id}/${join ? 'join' : 'leave'}/`);
      fetchGames();
    } catch {
      alert(join ? 'Failed to join.' : 'Failed to leave.');
    }
  };

  const handleCancel = async (game) => {
    await API.post(`games/${game.id}/cancel/`);
    fetchGames();
  };

  const handleDelete = async (game) => {
    await API.delete(`games/${game.id}/delete/`);
    fetchGames();
  };

  return (
    <main className="container mt-5">
      <header className="mb-4">
        <h1 className="display-6">Find & Join a Game</h1>
        <p className="lead text-muted">Browse upcoming sports events in your area</p>
      </header>

      <form className="row g-3 mb-4">
        {['name','sport', 'location', 'time'].map((field, i) => (
          <div key={i} className="col-md-3">
            <label htmlFor={`${field}Filter`} className="form-label text-secondary">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={`${field}Filter`}
              name={field}
              type="text"
              className="form-control"
              placeholder={'Enter ' + field}
              value={filters[field]}
              onChange={handleFilterChange}
            />
          </div>
        ))}
      </form>

      {error && <div role="alert" className="alert alert-danger">{error}</div>}

      <div className="games-grid">
        {filtered.map(game => {
          const stateKey = game.current_state.toLowerCase();
          const info = statusMap[stateKey] || { text: game.current_state, class: 'bg-secondary', icon: null };
          const isCreator = game.creator.id === user?.id;
          const joined = game.participants.some(p => p.user.id === user?.id);
          const iconSrc = SPORT_ICONS[game.sport.name] || SPORT_ICONS.DEFAULT;

          return (
            <div key={game.id} className="card shadow mb-3">
              {game.image_url && (
                <img
                  src={game.image_url}
                  alt={`${game.name} cover`}
                  className="card-img-top game-cover"
                />
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
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      ⋮
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to={`/games/${game.id}/edit`}>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleCancel(game)}>
                        Cancel
                      </Dropdown.Item>
                      <Dropdown.Item className="text-danger" onClick={() => handleDelete(game)}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : joined ? (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleJoinLeave(game, false)}
                  >
                    Leave <FaSignOutAlt className="ms-1" />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    disabled={game.current_state.toLowerCase() !== 'open'}
                    onClick={() => handleJoinLeave(game, true)}
                  >
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