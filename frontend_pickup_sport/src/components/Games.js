import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const INTERVAL = 7000;

const Games = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFiltered] = useState([]);
  const [currentUser, setCurrent] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ sport: '', location: '', time: '' });

  useEffect(() => {
    API.get('profile/')
      .then(({ data }) => setCurrent(data))
      .catch(() => {});
    fetchGames();
    const id = setInterval(fetchGames, INTERVAL);
    return () => clearInterval(id);
  }, []);

  const fetchGames = async () => {
    try {
      const { data } = await API.get('games/');
      setGames(data);
      applyFilters(data, filters);
      setError('');
    } catch {
      setError('Unable to load games.');
    }
  };

  const applyFilters = (list, f) => {
    let out = [...list];
    if (f.sport)    out = out.filter(g => g.sport.name.toLowerCase().includes(f.sport.toLowerCase()));
    if (f.location) out = out.filter(g => g.location.toLowerCase().includes(f.location.toLowerCase()));
    if (f.time)     out = out.filter(g => new Date(g.start_time).toLocaleString().includes(f.time));
    setFiltered(out);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    const n = { ...filters, [name]: value };
    setFilters(n);
    applyFilters(games, n);
  };

  const handleJoin = async game => {
    const isJoined = game.participants.some(p => p.user.id === currentUser?.id);
    if (isJoined) {
      return alert("You’ve already joined that game.");
    }
    const state = game.current_state.toLowerCase();
    if (state !== 'open') {
      return alert(" Only games in the Open state can be joined.");
    }
    try {
      await API.post(`games/${game.id}/join/`);
      alert("Successfully joined!");
      fetchGames();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join. Please try again.';
      alert(msg);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-3 d-flex">
        <input
          name="sport"
          placeholder="Sport"
          className="form-control me-2"
          style={{ width: 200 }}
          value={filters.sport}
          onChange={handleFilterChange}
        />
        <input
          name="location"
          placeholder="Location"
          className="form-control me-2"
          style={{ width: 200 }}
          value={filters.location}
          onChange={handleFilterChange}
        />
        <input
          name="time"
          placeholder="Time"
          className="form-control"
          style={{ width: 200 }}
          value={filters.time}
          onChange={handleFilterChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group mb-3">
        {filteredGames.map(game => {
          const state = game.current_state;
          const lc = state.toLowerCase();
          const isJoined = game.participants.some(p => p.user.id === currentUser?.id);
          const isCreator = game.creator.id === currentUser?.id;

          return (
            <li
              key={game.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <Link to={`/games/${game.id}`}>
                  <strong>{game.name}</strong> ({game.sport.name}) at{' '}
                  {new Date(game.start_time).toLocaleString()}
                </Link>
                <div className="mt-1">
                  <span
                    className={
                      'badge ' +
                      (state === 'Open'
                        ? 'bg-success'
                        : state === 'In Progress'
                        ? 'bg-primary'
                        : 'bg-danger')
                    }
                  >
                    {state}
                  </span>
                </div>
              </div>
              {isCreator && <span className="badge bg-secondary">Host</span>}
              {!isCreator && isJoined && (
                <span className="badge bg-info text-dark">Joined</span>
              )}
              {!isCreator && !isJoined && (
                <button
                  className="btn btn-primary"
                  disabled={lc !== 'open'}
                  title={lc === 'open' ? '' : 'Only Open games can be joined'}
                  onClick={() => handleJoin(game)}
                >
                  Join
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="d-flex justify-content-end">
        <Link to="/create-game" className="btn btn-success">
          Create New Game
        </Link>
      </div>
    </div>
  );
};

export default Games;
