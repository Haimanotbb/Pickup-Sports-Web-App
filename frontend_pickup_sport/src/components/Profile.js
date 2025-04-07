import { useState, useEffect } from 'react';
import API from '../api/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', favorite_sports: '' });
  const [error, setError] = useState('');

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('profile/');
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          favorite_sports: response.data.favorite_sports.map(s => s.id).join(', ')
        });
      } catch (err) {
        setError('Failed to load profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      name: formData.name,
      bio: formData.bio,
      favorite_sports: formData.favorite_sports.split(',').map(id => id.trim()).filter(id => id)
    };

    try {
      const response = await API.put('profile/update/', updatedData);
      setProfile(response.data);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  if (error) {
    return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  }
  if (!profile) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>User Profile</h2>
      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
          <p>
            <strong>Favorite Sports:</strong>{' '}
            {profile.favorite_sports.length > 0
              ? profile.favorite_sports.map(s => s.name).join(', ')
              : 'None'}
          </p>
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name:</label>
            <input 
              type="text" 
              name="name" 
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Bio:</label>
            <textarea 
              name="bio" 
              className="form-control" 
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Favorite Sports (comma-separated Sport IDs):</label>
            <input 
              type="text" 
              name="favorite_sports" 
              className="form-control" 
              value={formData.favorite_sports}
              onChange={handleChange}
            />
            <small className="form-text text-muted">
              Enter sport IDs separated by commas. (You can get available Sport IDs from the Sports endpoint.)
            </small>
          </div>
          <button type="submit" className="btn btn-success">Save</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
