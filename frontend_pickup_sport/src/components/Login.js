import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import CasLoginButton from './CasLoginButton'; // import the CAS button
import logo from '../assets/images/logo.png'; // adjust path as needed

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await API.post('login/', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/games');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '80px' }}>
      {/* Center everything in its own container */}
      <div style={{ textAlign: 'center' }}>
        {/* Logo stacked above the button */}
        <img
          src={logo}
          alt="Y-Pickup Logo"
          style={{ maxWidth: '300px', marginBottom: '30px' }}
        />
        <div style={{ marginBottom: '20px' }}>
          <CasLoginButton />
        </div>
      </div>
    </div>
  );
};

export default Login;
