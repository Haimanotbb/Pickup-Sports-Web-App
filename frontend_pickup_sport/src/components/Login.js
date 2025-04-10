import { useState } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import API from '../api/api';
import CasLoginButton from './CasLoginButton'; // import the CAS button

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
    <div className="container mt-4">
      <CasLoginButton />  
    </div>
  );
}; 

export default Login;
