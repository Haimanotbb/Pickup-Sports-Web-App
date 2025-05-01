import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import LocationPicker from './LocationPicker';

export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    location: '',
    latitude: null,
    longitude: null,
    start_time: '',
    end_time: '',
    skill_level: 'all',
  });
  const [sports, setSports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('sports/')
      .then(r => setSports(r.data))
      .catch(() => setError('Failed to fetch sports.'));

    API.get(`games/${id}/`)
      .then(r => {
        const g = r.data;
        setFormData({
          name:         g.name,
          sport_id:     g.sport.id,
          location:     g.location,
          latitude:     g.latitude,
          longitude:    g.longitude,
          start_time:   g.start_time.slice(0, 16), 
          end_time:     g.end_time.slice(0, 16),
          skill_level:  g.skill_level,
        });
      })
      .catch(() => setError('Failed to load game.'));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.put(`games/${id}/update/`, {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time:   new Date(formData.end_time).toISOString(),
      });
      navigate(`/games/${id}`);
    } catch {
      setError('Failed to update the game.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Game</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Game Name</label>
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
          <label>Sport</label>
          <select
            name="sport_id"
            className="form-select"
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
        <div className="mb-3">
          <label className="form-label">Pick a Location</label>
          <LocationPicker
            location={formData.location}
            setLocation={loc => setFormData(fd => ({ ...fd, location: loc }))}
            setLatLng={({ lat, lng }) =>
              setFormData(fd => ({ ...fd, latitude: lat, longitude: lng }))}
          />
        </div>
        <div className="mb-3 row">
          <div className="col">
            <label>Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              className="form-control"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label>End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              className="form-control"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label>Skill Level</label>
          <select
            name="skill_level"
            className="form-select"
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
          Save Changes
        </button>
      </form>
    </div>
  );
}
