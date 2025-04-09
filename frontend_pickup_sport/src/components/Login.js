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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="mt-3">
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
      <hr />
      <h4>Or</h4>
      <CasLoginButton />
    </div>
  );
}; 

export default Login;

//   return (
//     <div className="container mt-4">
//       <h2>Login</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>Email:</label>
//           <input 
//             type="email" 
//             name="email" 
//             className="form-control" 
//             value={formData.email}
//             onChange={handleChange}
//             required 
//           />
//         </div>
//         <div className="mb-3">
//           <label>Password:</label>
//           <input 
//             type="password" 
//             name="password" 
//             className="form-control" 
//             value={formData.password}
//             onChange={handleChange}
//             required 
//           />
//         </div>
//         <button type="submit" className="btn btn-primary">Log In</button>
//       </form>
//       <p className="mt-3">
//         Don't have an account? <Link to="/signup">Sign up here</Link>
//       </p>

//     </div>
//   );
// };

// export default Login;
