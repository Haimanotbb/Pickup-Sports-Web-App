// src/components/ProfileSetup.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ProfileSetup = () => {
  // State to store the list of sports (for the dropdown)
  const [sportsList, setSportsList] = useState([]);
  // State for form data: we only need bio and favorite_sports for the update.
  // Here, favorite_sports is an array of sport IDs.
  const [formData, setFormData] = useState({
    bio: '',
    favorite_sports: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the complete list of sports when the component mounts.
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

  // Handle changes for the bio field.
  const handleBioChange = (e) => {
    setFormData(prev => ({ ...prev, bio: e.target.value }));
  };

  // Handle changes for the multi-select element for favorite sports.
  const handleMultiSelectChange = (e) => {
    // e.target.selectedOptions is a collection of the <option> elements that are selected.
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, favorite_sports: selectedIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('profile/update/', formData);
      navigate('/games'); // Redirect after successfully updating the profile
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
        {/* Bio Field */}
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
        {/* Multi-select for Favorite Sports */}
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
