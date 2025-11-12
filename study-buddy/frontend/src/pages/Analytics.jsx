import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [token, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/analytics/dashboard', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">
          <div className="loading-spinner">
            <div className="spinner-icon"></div>
            <p>Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">
          <div className="error-state">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={fetchAnalytics} className="retry-btn">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { overview, charts, recentQuizAttempts, recentStudySessions } = analyticsData;

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-header">
          <div className="header-content">
            <h1 className="analytics-title">📊 Learning Analytics</h1>
            <p className="analytics-subtitle">
              Track your progress, {user?.username || user?.email}
            </p>
          </div>
          <div className="streak-badge-large">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <div className="streak-number">{overview.streak.current}</div>
              <div className="streak-label">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{overview.totalQuizzesTaken}</div>
              <div className="stat-label">Quizzes Taken</div>
            </div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{formatTime(overview.totalStudyTime)}</div>
              <div className="stat-label">Total Study Time</div>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{overview.averageQuizScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="stat-card stat-card-orange">
            <div className="stat-icon">📇</div>
            <div className="stat-content">
              <div className="stat-value">{overview.totalFlashcardsReviewed}</div>
              <div className="stat-label">Cards Reviewed</div>
            </div>
          </div>

          <div className="stat-card stat-card-pink">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-value">{overview.totalTopics}</div>
              <div className="stat-label">Study Topics</div>
            </div>
          </div>

          <div className="stat-card stat-card-teal">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">
                {overview.completedTopics}/{overview.totalTopics}
              </div>
              <div className="stat-label">Topics Completed</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Study Time Chart */}
          <div className="chart-card">
            <h2 className="chart-title">📈 Study Time (Last 7 Days)</h2>
            <div className="bar-chart">
              {charts.studyTimeByDay.map((day, index) => {
                const maxMinutes = Math.max(...charts.studyTimeByDay.map(d => d.minutes), 1);
                const heightPercent = (day.minutes / maxMinutes) * 100;
                
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ height: `${heightPercent}%` }}
                        title={`${day.minutes} minutes`}
                      >
                        <span className="bar-value">{day.minutes > 0 ? day.minutes : ''}</span>
                      </div>
                    </div>
                    <div className="bar-label">{day.day}</div>
                  </div>
                );
              })}
            </div>
            {charts.studyTimeByDay.every(d => d.minutes === 0) && (
              <div className="chart-empty">
                <p>No study sessions recorded in the last 7 days</p>
                <p>Start studying to see your progress!</p>
              </div>
            )}
          </div>

          {/* Performance Trend */}
          <div className="chart-card">
            <h2 className="chart-title">📊 Quiz Performance Trend</h2>
            {charts.performanceTrend.length > 0 ? (
              <div className="line-chart">
                <svg viewBox="0 0 400 200" className="line-svg">
                  {/* Grid lines */}
                  <line x1="30" y1="10" x2="30" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="30" y1="180" x2="390" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x="10" y="15" fill="rgba(255,255,255,0.7)" fontSize="10">100%</text>
                  <text x="15" y="95" fill="rgba(255,255,255,0.7)" fontSize="10">50%</text>
                  <text x="20" y="185" fill="rgba(255,255,255,0.7)" fontSize="10">0%</text>
                  
                  {/* Plot points and lines */}
                  {charts.performanceTrend.map((point, index) => {
                    if (index === 0) return null;
                    
                    const x1 = 30 + ((index - 1) / (charts.performanceTrend.length - 1)) * 360;
                    const y1 = 180 - (charts.performanceTrend[index - 1].score / 100) * 170;
                    const x2 = 30 + (index / (charts.performanceTrend.length - 1)) * 360;
                    const y2 = 180 - (point.score / 100) * 170;
                    
                    return (
                      <g key={index}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(139, 92, 246, 0.8)"
                          strokeWidth="3"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Plot points */}
                  {charts.performanceTrend.map((point, index) => {
                    const x = 30 + (index / (charts.performanceTrend.length - 1)) * 360;
                    const y = 180 - (point.score / 100) * 170;
                    
                    return (
                      <g key={`point-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#8b5cf6"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text 
                          x={x} 
                          y={y - 10} 
                          fill="white" 
                          fontSize="11" 
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {Math.round(point.score)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="chart-empty">
                <p>No quiz attempts recorded yet</p>
                <p>Take some quizzes to see your performance trend!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="activity-section">
          <div className="activity-card">
            <h2 className="activity-title">🎯 Recent Quiz Attempts</h2>
            {recentQuizAttempts.length > 0 ? (
              <div className="activity-list">
                {recentQuizAttempts.map((attempt, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <div className={`activity-score ${attempt.percentage >= 70 ? 'score-good' : attempt.percentage >= 50 ? 'score-ok' : 'score-low'}`}>
                        {Math.round(attempt.percentage)}%
                      </div>
                    </div>
                    <div className="activity-details">
                      <div className="activity-main">
                        {attempt.score}/{attempt.totalQuestions} correct
                      </div>
                      <div className="activity-meta">
                        {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="activity-empty">
                <p>No recent quiz attempts</p>
              </div>
            )}
          </div>

          <div className="activity-card">
            <h2 className="activity-title">📅 Recent Study Sessions</h2>
            {recentStudySessions.length > 0 ? (
              <div className="activity-list">
                {recentStudySessions.map((session, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <div className="session-icon">
                        {session.activityType === 'quiz' && '📝'}
                        {session.activityType === 'flashcard' && '📇'}
                        {session.activityType === 'planner' && '📅'}
                        {session.activityType === 'chat' && '💬'}
                      </div>
                    </div>
                    <div className="activity-details">
                      <div className="activity-main">
                        {session.activityType.charAt(0).toUpperCase() + session.activityType.slice(1)} Session
                      </div>
                      <div className="activity-meta">
                        {session.duration} minutes • {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="activity-empty">
                <p>No recent study sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="summary-card">
          <h2>🎓 Your Learning Journey</h2>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Current Streak:</span>
              <span className="summary-value">{overview.streak.current} days 🔥</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Longest Streak:</span>
              <span className="summary-value">{overview.streak.longest} days 🏆</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Created Content:</span>
              <span className="summary-value">
                {overview.totalQuizzes} quizzes, {overview.totalFlashcards} flashcard sets
              </span>
            </div>
          </div>
          <div className="encouragement">
            <p>
              {overview.averageQuizScore >= 80 
                ? "🌟 Excellent work! You're mastering the material!"
                : overview.averageQuizScore >= 60
                ? "👍 Good progress! Keep studying to improve further!"
                : "💪 Keep going! Consistent practice leads to improvement!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
