import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('signup/', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/games');  // go to the games page after signup
    } catch (err) {
      setError('Failed to sign up. Maybe email is taken?');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Sign Up</h2>
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
          <label>Password:</label>
          <input 
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="mb-3">
          <label>Name (Optional):</label>
          <input 
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
