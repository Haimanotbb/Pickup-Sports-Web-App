import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const CreateGame = () => {
  const [formData, setFormData] = useState({
    sport_id: '',
    location: '',
    start_time: '',
    end_time: '',
    status: 'open',
    skill_level: 'all',
  });
  const [sports, setSports] = useState([]); // State to hold the list of sports
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect to login if token is missing
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch the list of sports when the component mounts
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
      await API.post('games/create/', formData);
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
        {/* Sport dropdown */}
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
          <label>Status:</label>
          <select 
            name="status" 
            className="form-control" 
            value={formData.status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
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
