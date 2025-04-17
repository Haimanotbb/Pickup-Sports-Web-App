import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const CreateGame = () => {
  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    location: '',
    start_time: '',
    end_time: '',
    skill_level: 'all',
  });
  const [sports, setSports] = useState([]); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  //fetch sports list
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await API.get('sports/');
        setSports(response.data);
      } catch (err) {
        setError('Failed to fetch sports.');
      }
    };
    fetchSports();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      };
      await API.post('games/create/', payload);
      navigate('/games');
    } catch (err) {
      setError('Failed to create game.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create a Game</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
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
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Location:</label>
          <input 
            type="text" 
            name="location" 
            className="form-control" 
            value={formData.location}
            onChange={handleChange}
            required 
          />
        </div>
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
        <button type="submit" className="btn btn-primary">Create Game</button>
      </form>
    </div>
  );
};

export default CreateGame;
