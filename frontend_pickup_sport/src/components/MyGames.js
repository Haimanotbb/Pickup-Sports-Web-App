import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

const MyGames = () => {
  const [active, setActive] = useState([]);
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState('');

  // Fetches active and archived games for the user and handles errors if the API call fails.
  useEffect(() => {
    const fetch = async () => {
      try {
        const act = await API.get('my-games/');          
        const arch = await API.get('my-archived-games/');
        setActive(act.data);
        setArchived(arch.data);
      } catch {
        setError('Failed to fetch your games.');
      }
    };
    fetch();
  }, []);

  return (
    <div className="container mt-4">
      <h2>My Active Games</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {active.length
        ? active.map(g => (
            <div key={g.id} className="mb-2">
              <Link to={`/games/${g.id}`}>
                {g.name} — {g.current_state}
              </Link>
            </div>
          ))
        : <p>No active games.</p>
      }

      <h2 className="mt-4">My Archived Games</h2>
      {archived.length
        ? archived.map(g => (
            <div key={g.id} className="mb-2">
              <Link to={`/games/${g.id}`}>
                {g.name} — {g.current_state}
              </Link>
            </div>
          ))
        : <p>No archived games.</p>
      }
    </div>
  );
};

export default MyGames;
