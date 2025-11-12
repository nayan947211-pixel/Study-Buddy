// API Configuration
// Automatically switches between development and production URLs

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app' // Replace with actual Vercel backend URL after deployment
  : 'http://localhost:3000';

export default API_BASE_URL;

// Usage in components:
// import API_BASE_URL from '../config/api';
// axios.get(`${API_BASE_URL}/api/endpoint`)
