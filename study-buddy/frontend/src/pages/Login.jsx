import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../features/authSlice';
import axios from 'axios';
import './Auth.css';

const url = "http://localhost:3000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleClick(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userDetails = {
        email: email,
        password: password,
      };
      
      const response = await axios.post(`${url}/api/auth/login`, userDetails, {
        withCredentials: true
      });
      
      if (response.data.success && response.data.token) {
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        navigate('/');
      } else {
        setError(response.data.message || "Login failed");
      }
      
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleClick}>
          <div className="form-group">
            <span className="form-icon">✉️</span>
            <input 
              type="email" 
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <span className="form-icon">🔒</span>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                Logging in<span className="spinner"></span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register Here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login
