import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ProfileSetup = () => {
  const [sportsList, setSportsList] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    bio: '',
    favorite_sports: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all sports from the backend on mount
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

  // Handle general form field changes (for email, name, bio)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes for multi-select element (favorite sports)
  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, favorite_sports: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update the profile including email and name
      await API.put('profile/update/', formData);
      navigate('/games');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Complete Your Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
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
          <label>Favorite Sports:</label>
          <select
            multiple
            name="favorite_sports"
            className="form-select"
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
            Hold down the Ctrl (Windows) / Cmd (Mac) key to select multiple options.
          </small>
        </div>
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
