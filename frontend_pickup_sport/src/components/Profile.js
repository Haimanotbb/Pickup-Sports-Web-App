import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; import API from '../api/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1) fetch your own profile
    API.get('profile/')
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile.'));

    // 2) fetch your archived games
    API.get('my-archived-games/')
      .then(res => setArchived(res.data))
      .catch(() => setError('Failed to load archived games.'));
  }, []);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  if (!profile) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>My Profile</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/profile/setup')}
        >
          Edit Profile
        </button>
      </div>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
      <p>
        <strong>Favorite Sports:</strong>{' '}
        {profile.favorite_sports.length
          ? profile.favorite_sports.map(s => s.name).join(', ')
          : 'None'}
      </p>

      <hr />

      <h3>My Past Games</h3>
      {archived.length > 0 ? (
        <ul className="list-group">
          {archived.map(game => (
            <li key={game.id} className="list-group-item">
              {game.name || game.sport.name} —{' '}
              {new Date(game.start_time).toLocaleString()} →{' '}
              <em>{game.current_state}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven’t created any past games yet.</p>
      )}
    </div>
  );
};

export default Profile;
