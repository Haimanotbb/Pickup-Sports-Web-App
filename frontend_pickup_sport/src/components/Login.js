// src/components/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('login/', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/games');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Login</h2>
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
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
    </div>
  );
};

export default Login;
