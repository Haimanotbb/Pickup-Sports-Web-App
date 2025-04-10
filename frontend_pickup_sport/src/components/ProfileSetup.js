import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ProfileSetup = () => {
  const [sportsList, setSportsList] = useState([]);
  const [formData, setFormData] = useState({
    bio: '',
    favorite_sports: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
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

  const handleBioChange = (e) => {
    setFormData(prev => ({ ...prev, bio: e.target.value }));
  };

  const handleMultiSelectChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, favorite_sports: selectedIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('profile/update/', formData);
      navigate('/games');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Complete Your Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            value={formData.bio}
            onChange={handleBioChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="favoriteSports" className="form-label">Favorite Sports:</label>
          <select
            id="favoriteSports"
            name="favorite_sports"
            className="form-select"
            multiple
            value={formData.favorite_sports}
            onChange={handleMultiSelectChange}
          >
            {sportsList.map(sport => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Hold down the Ctrl (Windows) or Cmd (Mac) key to select multiple options.
          </small>
        </div>
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
