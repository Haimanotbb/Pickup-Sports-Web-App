import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Add a request interceptor to include the token, if present.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
