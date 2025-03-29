import axios from 'axios';

const token = localStorage.getItem('token');

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    // If token exists, include it in the request header
    Authorization: token ? `Token ${token}` : '',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;
