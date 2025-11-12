import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../features/authSlice";
import "./Home.css";

const Home = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const navigate = useNavigate();
  const token = useSelector(selectToken);

  const handleSubmit = async (selectedFile) => {
    const fileToUpload = selectedFile || file;
    
    if (!fileToUpload) {
      setError('Please select a PDF file!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      console.log("Uploading file:", fileToUpload.name);
      const response = await axios.post(
        "http://localhost:3000/api/pdf/getData",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response.data);

      if (response.data.success) {
        setResult(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to extract PDF");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Error uploading file. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!result || !result.text) {
      setError('Please upload a PDF first!');
      return;
    }

    if (!token) {
      setError('Please login to generate quizzes');
      navigate('/login');
      return;
    }

    setQuizLoading(true);
    setError(null);

    try {
      console.log('Generating quiz...');
      const response = await axios.post('http://localhost:3000/api/quiz/generate', {
        text: result.text,
        numQuestions: parseInt(numQuestions),
        difficulty: difficulty,
        title: `Quiz from ${file?.name || 'PDF'}`
      }, {
        withCredentials: true
      });

      console.log('Quiz Response:', response.data);
      
      if (response.data.success) {
        alert('Quiz generated successfully!');
        navigate('/quiz');
      } else {
        setError(response.data.message || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error generating quiz. Please try again.';
      setError(errorMsg);
    } finally {
      setQuizLoading(false);
    }
  };


  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-subtitle">
            Strengthen your concepts
          </h2>
          <h1 className="hero-title">
            Study Buddy
          </h1>

          {/* Bento Grid */}
          <div className="bento-grid">
            {/* Large Card - AI Quiz Generation */}
            <div className="bento-card bento-card-large" onClick={() => navigate('/quiz')}>
              <h3>AI Quiz Generation</h3>
              <p>Upload your documents and let our AI create personalized quizzes to test your knowledge and strengthen your understanding.</p>
              <button className="bento-button">Generate Quiz</button>
            </div>

            {/* Small Card 1 - Flashcards */}
            <div className="bento-card bento-card-small" onClick={() => navigate('/flashcards')}>
              <h3>Smart Flashcards</h3>
              <p>Create and review flashcards for effective memorization.</p>
              <button className="bento-button">Study Cards</button>
            </div>

            {/* Small Card 2 - Study Planner */}
            <div className="bento-card bento-card-small" onClick={() => navigate('/planner')}>
              <h3>Study Planner</h3>
              <p>Organize your study schedule and track your progress.</p>
              <button className="bento-button">Plan Study</button>
            </div>
          </div>
        </div>
      </section>

      <section className="upload-section">
        <div className="upload-container">
          <div className="upload-card">
            <div className="upload-icon">📤</div>
            <h3 className="upload-title">
              Upload your document to get started
            </h3>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  handleSubmit(selectedFile);
                }
              }}
              style={{ display: 'none' }}
              id="fileInput"
            />
            
            {!result ? (
              <button 
                className="upload-button" 
                onClick={() => {
                  if (!token) {
                    setError('Please login to upload documents');
                    navigate('/login');
                    return;
                  }
                  document.getElementById('fileInput').click();
                }}
                disabled={loading}
              >
                {loading ? 'Uploading...' : (file ? `Selected: ${file.name}` : 'Upload your document')}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                <p style={{ color: '#28a745', fontWeight: '600' }}>
                  ✓ Document uploaded successfully! ({result.numPages} pages)
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Number of Questions:
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '0.5rem',
                        marginTop: '0.5rem',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }}
                    />
                  </label>
                  
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Difficulty:
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '0.5rem',
                        marginTop: '0.5rem',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </label>
                </div>
                
                <button 
                  className="upload-button" 
                  onClick={handleGenerateQuiz}
                  disabled={quizLoading}
                  style={{ marginTop: '1rem' }}
                >
                  {quizLoading ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
                
                <button 
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Upload Different Document
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '12px',
              color: '#c00',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Chat Section */}
      <section className="chat-section">
        <div className="chat-container">
          <div className="chat-content">
            {/* Phone Mockup */}
            <div className="phone-mockup">
              <div className="phone-card">
                <div className="phone-inner">
                  <div className="phone-header">
                    <div className="phone-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="phone-dots">
                      <div className="phone-dot"></div>
                      <div className="phone-dot"></div>
                      <div className="phone-dot"></div>
                    </div>
                  </div>
                  
                  <div className="phone-text">
                    <h4>Hello!</h4>
                    <p>
                      Study Buddy allows you AI-driven learning assistance with personalized 
                      quiz generation. Upload your study materials and get custom quizzes 
                      tailored to your learning needs. Track your progress and strengthen 
                      your understanding of key concepts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="chat-text-content">
              <div className="chat-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span>AI-Powered Learning</span>
              </div>
              <h2 className="chat-heading">
                Chat with the advanced AI tutor to learn new concepts.
              </h2>
              <p className="chat-description">
                Upload your courses and discuss with the AI how you can 
                structure your learning to go from zero to pro in the chosen 
                subject. Feel free to ask more about your learning goals!
              </p>
              <div className="chat-buttons">
                <button className="chat-button-primary" onClick={() => navigate('/quiz')}>
                  Start Learning
                </button>
                <button className="chat-button-secondary">
                  See how it works
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Gradient */}
      <section className="footer-gradient"></section>
    </div>
  );
};

export default Home;
