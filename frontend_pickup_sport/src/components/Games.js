import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const INTERVAL = 7000

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
    applyFilters(games, newFilters); 
  };

  const handleJoin = async (gameId, state) => {
    if (state !== 'Open'){
      alert('You can only join games that are open.')
      return;
    }
    try {
      await API.post(`games/${gameId}/join/`);
      alert('Successfully joined the game!');
      fetchGames()
    } catch (err) {
      setError('Failed to join the game.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <input
          type="text"
          name="sport"
          placeholder="Enter sport"
          value={filters.sport}
          onChange={handleFilterChange}
          className="form-control d-inline-block me-2"
          style={{ width: '200px' }}
        />
        <input
          type="text"
          name="location"
          placeholder="Enter location"
          value={filters.location}
          onChange={handleFilterChange}
          className="form-control d-inline-block me-2"
          style={{ width: '200px' }}
        />
        <input
          type="text"
          name="time"
          placeholder="Enter time"
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
            <div>
              <Link to={`/games/${game.id}`}>
                <strong>{game.name}</strong> ({game.sport.name}) at{' '} 
                {new Date(game.start_time).toLocaleString()}
              </Link>
              <div className="mt-1">
                <span className={
                  'badge ' +
                  (game.current_state === 'Open'
                    ? 'bg-success'
                    : game.current_state === 'In Progress'
                    ? 'bg-primary'
                    : 'bg-danger')
                }>
                  {game.current_state}
                </span>
              </div>
            </div>
            <button
              className="btn btn-primary ms-3"
              disabled={game.current_state !== 'Open'}
              onClick={() => handleJoin(game.id, game.current_state)}
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
