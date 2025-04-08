import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const INTERVAL = 30000

const Games = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    sport: '',
    location: '',
    time: '',
  });

  const fetchGames = async () => {
    try {
      const response = await API.get('games/');
      setGames(response.data);
      applyFilters(response.data, filters);
      setError('');
    } catch (err) {
      setError('Failed to fetch games.');
    }
  };

  const applyFilters = (gamesList, currentFilters) => {
    let result = [...gamesList];
    if (currentFilters.sport) {
      result = result.filter((game) =>
        game.sport.name.toLowerCase().includes(currentFilters.sport.toLowerCase())
      );
    }
    if (currentFilters.location) {
      result = result.filter((game) =>
        game.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }
    if (currentFilters.time) {
      result = result.filter((game) =>
        new Date(game.start_time).toLocaleString().includes(currentFilters.time)
      );
    }
    setFilteredGames(result);
  };

  useEffect(() => {
    fetchGames();
    const intervalId = setInterval(fetchGames, INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(games, newFilters); //filter cached games
  };

  const handleJoin = async (gameId) => {
    try {
      await API.post(`games/${gameId}/join/`);
      alert('Successfully joined the game!');
      // Optionally refetch games here to update UI
    } catch (err) {
      setError('Failed to join the game.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <Link to="/profile" className="btn btn-secondary">
          My Profile
        </Link>
      </div>

      {/* Filter Inputs */}
      <div className="mb-3">
        <input
          type="text"
          name="sport"
          placeholder="Filter by sport"
          value={filters.sport}
          onChange={handleFilterChange}
          className="form-control d-inline-block me-2"
          style={{ width: '200px' }}
        />
        <input
          type="text"
          name="location"
          placeholder="Filter by location"
          value={filters.location}
          onChange={handleFilterChange}
          className="form-control d-inline-block me-2"
          style={{ width: '200px' }}
        />
        <input
          type="text"
          name="time"
          placeholder="Filter by time"
          value={filters.time}
          onChange={handleFilterChange}
          className="form-control d-inline-block"
          style={{ width: '200px' }}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="list-group">
        {filteredGames.map((game) => (
          <li key={game.id} className="list-group-item">
            <Link to={`/games/${game.id}`}>
              {game.sport.name} at {game.location} on {new Date(game.start_time).toLocaleString()}
            </Link>
            <button
              className="btn btn-primary ms-3"
              onClick={() => handleJoin(game.id)}
            >
              Join
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <Link to="/create-game" className="btn btn-success">
          Create New Game
        </Link>
      </div>
    </div>
  );
};

export default Games;
