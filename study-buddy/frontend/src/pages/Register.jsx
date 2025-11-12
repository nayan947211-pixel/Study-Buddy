import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../features/authSlice";
import axios from "axios";
import './Auth.css';

const url = "http://localhost:3000";

const Register = () => {
  const [name, setName] = useState("");
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
        username: name,
        email: email,
        password: password,
      };
      
      const response = await axios.post(`${url}/api/auth/register`, userDetails, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Store token and user data in Redux for automatic login
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        
        // Navigate to home page
        navigate('/');
      }
      
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleClick}>
          <div className="form-group">
            <span className="form-icon">👤</span>
            <input 
              type="text" 
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
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
              minLength="6"
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
                Signing up<span className="spinner"></span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="auth-link">
          Already registered ? <Link to="/login">Login Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
