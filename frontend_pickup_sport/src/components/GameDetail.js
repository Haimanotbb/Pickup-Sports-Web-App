import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';  // ← UPDATED: import useNavigate
import API from '../api/api';

const INTERVAL = 7000;

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  // figure out if I’m already in this game
  const isJoined = game?.participants?.some(
    p => p.user.id === currentUser?.id
  );

  // Fetch both game details and current user profile
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [gRes, meRes] = await Promise.all([
          API.get(`games/${id}/`),
          API.get('profile/'),
        ]);
        setGame(gRes.data);
        setCurrentUser(meRes.data);
      } catch {
        setError('Failed to fetch game or user details.');
      }
    };
    fetchAll();
    const intervalId = setInterval(fetchAll, INTERVAL);
    return () => clearInterval(intervalId);
  }, [id]);

  // Action handlers for the creator
  const handleCancel = async () => {
    await API.post(`games/${id}/cancel/`);
    // re-fetch to get updated current_state
    const refreshed = await API.get(`games/${id}/`);
    setGame(refreshed.data);
  };

  const handleEdit = () => {
    navigate(`/games/${id}/edit`);
  };

  const handleDelete = async () => {
    await API.delete(`games/${id}/delete/`);
    navigate('/games');
  };
  const handleJoin = async () => {
    if (game.current_state !== 'Open') {
      alert('Only Open games can be joined.');
      return;
    }
    try {
      await API.post(`games/${id}/join/`);
      const refreshed = await API.get(`games/${id}/`);
      setGame(refreshed.data);
    } catch {
      setError('Failed to join the game.');
    }
  };

  // new “leave” handler
  const handleLeave = async () => {
    try {
      await API.post(`games/${id}/leave/`);
      const refreshed = await API.get(`games/${id}/`);
      setGame(refreshed.data);
    } catch {
      setError('Failed to leave the game.');
    }
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  if (!game || !currentUser) {
    return <div className="container mt-4">Loading...</div>;
  }

  // Check if I am the creator
  const isCreator = game.creator.id === currentUser.id;

  return (
    <div className="container mt-4">
      <h2>{game.name}</h2>

      <p><strong>Sport:</strong> {game.sport.name}</p>
      <p><strong>Location:</strong> {game.location}</p>
      <p>
        <strong>Start Time:</strong>{' '}
        {new Date(game.start_time).toLocaleString()}
      </p>
      <p>
        <strong>End Time:</strong>{' '}
        {new Date(game.end_time).toLocaleString()}
      </p>
      <p><strong>State:</strong> {game.current_state}</p>
      <p><strong>Skill Level:</strong> {game.skill_level}</p>
      <p>
        <strong>Creator:</strong> {game.creator.name} ({game.creator.email})
      </p>
      {!isCreator && (
        <>
          {isJoined ? (
            <button
              className="btn btn-warning me-2"
              onClick={handleLeave}
            >
              Leave Game
            </button>
          ) : (
            <button
              className="btn btn-primary me-2"
              disabled={game.current_state !== 'Open'}
              onClick={handleJoin}
            >
              Join Game
            </button>
          )}
        </>
      )}

      {isCreator && (
        <div className="mt-3">
          {game.current_state !== 'Completed' && (
            <button className="btn btn-warning me-2" onClick={handleCancel}>
              Cancel Game
            </button>
          )}
          <button className="btn btn-secondary me-2" onClick={handleEdit}>
            Edit Game
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Game
          </button>
        </div>
      )}

      <hr />
      {game.participants && game.participants.length > 0 ? (
        <>
          <h4>Participants</h4>
          <ul className="list-group">
            {game.participants.map((p) => (
              <li key={p.id} className="list-group-item">
                <Link to={`/profile/${p.user.id}`}>
                  {p.user.name || p.user.email}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No participants yet.</p>
      )}
    </div>
  );
};

export default GameDetail;
