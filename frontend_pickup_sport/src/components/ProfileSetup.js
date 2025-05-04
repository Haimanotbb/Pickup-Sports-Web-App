import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ProfileSetup = () => {
  const [sportsList, setSportsList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    favorite_sports: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //loads profile and sports data
  useEffect(() => {
    API.get('profile/')
      .then(res => {
        const { name, email, bio, favorite_sports } = res.data;
        setFormData({
          name: name || '',
          email: email || '',
          bio: bio || '',
          favorite_sports: favorite_sports.map(s => s.id)
        });
      })
      .catch(() => console.error('Failed to load profile'));
    API.get('sports/')
      .then(res => setSportsList(res.data))
      .catch(() => console.error('Failed to load sports'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleMultiSelectChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, o => o.value);
    setFormData(prev => ({ ...prev, favorite_sports: selectedIds }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('profile/update/', formData);
      navigate('/games');
    } catch {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Complete Your Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Bio */}
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

        {/* Favorite Sports*/}
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
            Hold down Ctrl (Windows) or Cmd (Mac) to select multiple.
          </small>
        </div>
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form >
    </div >
  );
};

export default ProfileSetup;
