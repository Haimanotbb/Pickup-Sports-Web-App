import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';

const INTERVAL = 7000

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await API.get(`games/${id}/`);
        setGame(response.data);
      } catch (err) {
        setError('Failed to fetch game details.');
      }
    };
    
    fetchGame();
    const intervalId = setInterval(fetchGame, INTERVAL);
    return () => clearInterval(intervalId);
  }, [id]);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  if (!game) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Game Detail</h2>
      <p><strong>Sport:</strong> {game.sport.name}</p>
      <p><strong>Location:</strong> {game.location}</p>
      <p>
        <strong>Start Time:</strong> {new Date(game.start_time).toLocaleString()}
      </p>
      <p>
        <strong>End Time:</strong> {new Date(game.end_time).toLocaleString()}
      </p>
      <p><strong>Status:</strong> {game.status}</p>
      <p><strong>Skill Level:</strong> {game.skill_level}</p>
      <p><strong>Creator:</strong> {game.creator.name || ''} ({game.creator.email})</p>
      
      {game.participants && game.participants.length > 0 ? (
        <div>
          <h4>Participants:</h4>
          <ul className="list-group">
            {game.participants.map((participant) => (
              <li key={participant.id} className="list-group-item">
                <Link to={`/profile/${participant.user.id}`}>
                  {participant.user.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No participants yet.</p>
      )}
    </div>
  );
};

export default GameDetail;
