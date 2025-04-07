import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api';

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get(`profile/${id}/`);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, [id]);

  if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (!profile) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Public Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
      <p>
        <strong>Favorite Sports:</strong>{' '}
        {profile.favorite_sports && profile.favorite_sports.length > 0
          ? profile.favorite_sports.map(sport => sport.name).join(', ')
          : 'None'}
      </p>
    </div>
  );
};

export default PublicProfile;
