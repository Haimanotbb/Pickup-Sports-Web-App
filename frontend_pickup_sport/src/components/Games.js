import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const Games = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Ensure user is logged in
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch games from the backend
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

    const intervalId = setInterval(() => {
      fetchGames();
    }, 5000);

    return () => clearInterval(intervalId);

  }, []);

  const handleJoin = async (gameId) => {
    try {
      await API.post(`games/${gameId}/join/`);
      alert('Successfully joined the game!');
    } catch (err) {
      const serverError = err.response?.data?.error || 'Failed to join the game.';
      setError(serverError);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Games</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {games.map((game) => (
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
        <Link to="/create-game" className="btn btn-success">Create New Game</Link>
      </div>
    </div>
  );
};

export default Games;