import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logout } from '../features/authSlice';

const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '80px',
      padding: '1rem 2rem',
      margin: '1.5rem auto',
      maxWidth: '92%',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Logo/Brand */}
        <Link to="/" style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: 'rgba(0, 0, 0, 0.8)',
          textDecoration: 'none',
          fontFamily: '"Germania One", cursive'
        }}>
          Study Buddy
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/quiz" style={{
              color: 'rgba(0, 0, 0, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              Quizzes
            </Link>
            <Link to="/flashcards" style={{
              color: 'rgba(0, 0, 0, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              Flashcards
            </Link>
            <Link to="/planner" style={{
              color: 'rgba(0, 0, 0, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              Planner
            </Link>
            <Link to="/analytics" style={{
              color: 'rgba(0, 0, 0, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              Analytics
            </Link>
            <Link to="/chat" style={{
              color: 'rgba(0, 0, 0, 0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              AI Chat
            </Link>
          </div>
        )}

        {/* Auth Buttons / User Info */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {isAuthenticated && user ? (
            <>
              <span style={{
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '0.9rem',
                fontWeight: '400',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                Welcome, {user.username || user.email}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'rgba(220, 38, 38, 0.8)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px 0 rgba(31, 38, 135, 0.2)',
                  fontFamily: '"Germania One", cursive'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(31, 38, 135, 0.2)';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'rgba(0, 0, 0, 0.8)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                Sign In
              </Link>
              
              <Link to="/register">
                <button style={{
                  background: 'rgba(139, 92, 246, 0.8)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px 0 rgba(139, 92, 246, 0.3)',
                  fontFamily: '"Germania One", cursive'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(139, 92, 246, 0.3)';
                }}
                >
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
