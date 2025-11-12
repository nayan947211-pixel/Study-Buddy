import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "../features/authSlice";
import axios from "axios";
import "./Planner.css";

const Planner = () => {
  const [schedule, setSchedule] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    estimatedTime: 60,
    priority: 'medium'
  });
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
  }, [token]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/planner/schedule', {
        withCredentials: true
      });
      if (response.data.success) {
        setSchedule(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3000/api/planner/add-topic',
        newTopic,
        { withCredentials: true }
      );
      if (response.data.success) {
        setTopics([response.data.data, ...topics]);
        setNewTopic({
          title: '',
          description: '',
          difficulty: 'medium',
          estimatedTime: 60,
          priority: 'medium'
        });
        setShowAddTopic(false);
        fetchSchedule();
      }
    } catch (err) {
      console.error('Error adding topic:', err);
      alert(err.response?.data?.message || 'Failed to add topic');
    }
  };

  const markAsComplete = async (topicId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/planner/complete/${topicId}`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        fetchSchedule();
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#999';
    }
  };

  return (
    <div className="planner-page">
      <div className="planner-container">
        <div className="planner-header">
          <h1 className="planner-title">📅 Study Planner</h1>
          <p className="planner-subtitle">Smart revision schedule based on your progress</p>
          <button 
            className="add-topic-btn"
            onClick={() => setShowAddTopic(!showAddTopic)}
          >
            + Add New Topic
          </button>
        </div>

        {showAddTopic && (
          <div className="add-topic-modal">
            <form onSubmit={handleAddTopic} className="add-topic-form">
              <h3>Add New Topic</h3>
              <input
                type="text"
                placeholder="Topic Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={newTopic.description}
                onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                rows="3"
              />
              <div className="form-row">
                <select
                  value={newTopic.difficulty}
                  onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  value={newTopic.priority}
                  onChange={(e) => setNewTopic({...newTopic, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="Estimated Time (minutes)"
                value={newTopic.estimatedTime}
                onChange={(e) => setNewTopic({...newTopic, estimatedTime: parseInt(e.target.value)})}
                min="15"
                step="15"
              />
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Add Topic</button>
                <button type="button" onClick={() => setShowAddTopic(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="schedule-section">
          <h2>Your Study Schedule</h2>
          {loading ? (
            <div className="loading">Loading your schedule...</div>
          ) : schedule.length > 0 ? (
            <div className="schedule-grid">
              {schedule.map((item) => (
                <div key={item._id} className="schedule-card">
                  <div 
                    className="priority-badge"
                    style={{ background: getPriorityColor(item.priority) }}
                  >
                    {item.priority}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="schedule-meta">
                    <span className="difficulty-badge">{item.difficulty}</span>
                    <span className="time-badge">⏱️ {item.estimatedTime} min</span>
                  </div>
                  <div className="schedule-footer">
                    <span className="schedule-date">
                      📅 {new Date(item.scheduledFor).toLocaleDateString()}
                    </span>
                    {!item.completed && (
                      <button
                        className="complete-btn"
                        onClick={() => markAsComplete(item._id)}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    {item.completed && (
                      <span className="completed-badge">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No scheduled topics yet. Add topics to create your study plan!</p>
            </div>
          )}
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>📊 Progress</h3>
            <div className="stat-value">
              {schedule.filter(s => s.completed).length} / {schedule.length}
            </div>
            <p>Topics Completed</p>
          </div>
          <div className="stat-card">
            <h3>⏰ Total Time</h3>
            <div className="stat-value">
              {schedule.reduce((acc, s) => acc + (s.estimatedTime || 0), 0)} min
            </div>
            <p>Scheduled Study Time</p>
          </div>
          <div className="stat-card">
            <h3>🎯 Completion Rate</h3>
            <div className="stat-value">
              {schedule.length > 0 
                ? Math.round((schedule.filter(s => s.completed).length / schedule.length) * 100)
                : 0}%
            </div>
            <p>Overall Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
