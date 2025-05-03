// src/components/CreateGame.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import LocationPicker from './LocationPicker';

export default function CreateGame() {
  const navigate = useNavigate();

  // formData now includes location & coords
  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    location: '',
    latitude: null,
    longitude: null,
    start_time: '',
    end_time: '',
    skill_level: 'all',
    capacity: '',
  });
  const [sports, setSports] = useState([]);
  const [error, setError]   = useState('');     // generic error
  const [dateError, setDateError] = useState(''); // validation error

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    API.get('sports/')
       .then(r => setSports(r.data))
       .catch(() => setError('Failed to fetch sports.'));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    // clear previous errors when user edits
    if (name === 'start_time' || name === 'end_time') {
      setDateError('');
    }
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setDateError('');
    setError('');

    // Validation: start time in the future
    const now = new Date();
    const start = new Date(formData.start_time);
    const end   = new Date(formData.end_time);

    if (start <= now) {
      setDateError('Start time must be in the future.');
      return;
    }
    // Validation: end after start
    if (end <= start) {
      setDateError('End time must be after the start time.');
      return;
    }

    try {
      await API.post('games/create/', {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time:   new Date(formData.end_time).toISOString(),
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      });
      navigate('/games');
    } catch {
      setError('Failed to create game.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create a Game</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {dateError && <div className="alert alert-warning">{dateError}</div>}
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-3">
          <label>Game Name:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Sport */}
        <div className="mb-3">
          <label>Sport:</label>
          <select
            name="sport_id"
            className="form-control"
            value={formData.sport_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a sport</option>
            {sports.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        <div className="mb-3">
          <label>Capacity (max players):</label>
          <input
            type="number"
            name="capacity"
            className="form-control"
            min="1"
            placeholder="Leave blank for unlimited"
            value={formData.capacity}
            onChange={handleChange}
          />
        </div>

        {/* Location Picker */}
        <div className="mb-3">
          <label className="form-label">Pick a Location:</label>
          <LocationPicker
            location={formData.location}
            setLocation={loc => setFormData(fd => ({ ...fd, location: loc }))}
            setLatLng={({ lat, lng }) =>
              setFormData(fd => ({ ...fd, latitude: lat, longitude: lng }))}
          />
        </div>

        {/* Start Time */}
        <div className="mb-3">
          <label>Start Time:</label>
          <input
            type="datetime-local"
            name="start_time"
            className="form-control"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>

        {/* End Time */}
        <div className="mb-3">
          <label>End Time:</label>
          <input
            type="datetime-local"
            name="end_time"
            className="form-control"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>

        {/* Skill Level */}
        <div className="mb-3">
          <label>Skill Level:</label>
          <select
            name="skill_level"
            className="form-control"
            value={formData.skill_level}
            onChange={handleChange}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Game
        </button>
      </form>
    </div>
  );
}
