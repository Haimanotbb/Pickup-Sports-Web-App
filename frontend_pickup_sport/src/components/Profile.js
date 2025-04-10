import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [sportsList, setSportsList] = useState([]); 
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', bio: '', favorite_sports: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('profile/');
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          favorite_sports: response.data.favorite_sports.map(s => s.id.toString())
        });
      } catch (err) {
        setError('Failed to load profile.');
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await API.get('sports/');
        setSportsList(response.data);
      } catch (err) {
        console.error('Failed to fetch sports');
      }
    };
    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, favorite_sports: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      name: formData.name,
      bio: formData.bio,
      favorite_sports: formData.favorite_sports 
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
            <label htmlFor="name" className="form-label">Name:</label>
            <input 
              id="name"
              type="text" 
              name="name" 
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">Bio:</label>
            <textarea 
              id="bio"
              name="bio" 
              className="form-control" 
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="favoriteSports" className="form-label">Favorite Sports:</label>
            <select
              id="favoriteSports"
              multiple
              name="favorite_sports"
              className="form-select"
              value={formData.favorite_sports}
              onChange={handleMultiSelectChange}
            >
              {sportsList.map(sport => (
                <option key={sport.id} value={sport.id.toString()}>
                  {sport.name}
                </option>
              ))}
            </select>
            <small className="form-text text-muted">
              Hold down Ctrl (Windows) or Cmd (Mac) to select multiple options.
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
