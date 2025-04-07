import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const Games = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await API.get('games/');
        setGames(response.data);
      } catch (err) {
        setError('Failed to fetch games.');
      }
    };
    fetchGames();
  }, []);

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

      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="list-group">
        {games.map((game) => (
          <li key={game.id} className="list-group-item">
            {/* Example: link to game detail, plus a Join button */}
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
