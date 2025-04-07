// src/components/ProfileSetup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    bio: '',
    favorite_sports: '' 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      bio: formData.bio,
      favorite_sports: formData.favorite_sports
        .split(',')
        .map(s => s.trim())
        .filter(s => s) 
    };
    try {
      await API.put('profile/update/', updatedData);
      navigate('/games');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Set Up Your Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
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
            For example: 1, 3, 5 (Make sure you know the available sport IDs)
          </small>
        </div>
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
