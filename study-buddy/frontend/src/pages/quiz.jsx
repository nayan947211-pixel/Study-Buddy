import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('view'); // 'view' or 'take'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchQuizzes();
  }, [isAuthenticated, navigate]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/quiz');
      
      if (response.data.success) {
        setQuizzes(response.data.data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.message || 'Error fetching quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizMode('view');
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizMode('take');
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStartTime(Date.now()); // Track when quiz started
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
    setQuizMode('view');
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleSelectAnswer = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const score = calculateScore();
    const timeSpent = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0; // Time in seconds
    
    // Send quiz results to backend for analytics tracking
    try {
      await axios.post('http://localhost:3000/api/quiz/complete', {
        quizId: selectedQuiz._id,
        score: score,
        totalQuestions: selectedQuiz.questions.length,
        timeSpent: timeSpent,
        selectedAnswers: selectedAnswers
      }, {
        withCredentials: true
      });
      console.log('Quiz results recorded in analytics');
    } catch (error) {
      console.error('Failed to record quiz analytics:', error);
      // Don't block the user from seeing results even if analytics fails
    }
    
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-container" style={{ textAlign: 'center' }}>
          <h2 className="quiz-title">Loading quizzes...</h2>
        </div>
      </div>
    );
  }

  // Quiz Taking Mode
  if (selectedQuiz && quizMode === 'take') {
    if (showResults) {
      const score = calculateScore();
      const percentage = (score / selectedQuiz.questions.length * 100).toFixed(1);
      
      return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{ color: percentage >= 70 ? '#28a745' : percentage >= 50 ? '#ffc107' : '#dc3545' }}>
              Quiz Results
            </h1>
            <div style={{ fontSize: '48px', margin: '30px 0' }}>
              {score} / {selectedQuiz.questions.length}
            </div>
            <div style={{ fontSize: '24px', marginBottom: '30px' }}>
              {percentage}%
            </div>
            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
              {percentage >= 70 ? '🎉 Excellent!' : percentage >= 50 ? '👍 Good job!' : '📚 Keep practicing!'}
            </p>
            
            <div style={{ marginTop: '30px' }}>
              <h3>Answer Review:</h3>
              {selectedQuiz.questions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <div key={index} style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                    borderRadius: '8px',
                    textAlign: 'left'
                  }}>
                    <strong>Q{index + 1}:</strong> {q.question}
                    <div style={{ marginTop: '10px' }}>
                      <div>Your answer: <strong>{userAnswer || 'Not answered'}</strong></div>
                      <div>Correct answer: <strong style={{ color: '#28a745' }}>{q.correctAnswer}</strong></div>
                      {isCorrect ? (
                        <span style={{ color: '#28a745' }}>✓ Correct!</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>✗ Incorrect</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleStartQuiz(selectedQuiz)}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Retake Quiz
              </button>
              <button 
                onClick={handleCloseQuiz}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = selectedQuiz.questions[currentQuestion];
    const totalQuestions = selectedQuiz.questions.length;
    
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={handleCloseQuiz}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Exit Quiz
        </button>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{selectedQuiz.title}</h2>
            <span style={{ fontSize: '18px', color: '#666' }}>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            marginBottom: '30px'
          }}>
            <div style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }}></div>
          </div>

          {/* Question */}
          <h3 style={{ marginBottom: '30px', fontSize: '20px' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div style={{ marginBottom: '30px' }}>
            {currentQ.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswers[currentQuestion] === letter;
              
              return (
                <div 
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion, letter)}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: isSelected ? '#2196F3' : '#f8f9fa',
                    color: isSelected ? 'white' : 'black',
                    border: isSelected ? '2px solid #2196F3' : '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}
                >
                  <strong style={{ minWidth: '30px' }}>{letter}.</strong>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: currentQuestion === 0 ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>

            <div style={{ fontSize: '14px', color: '#666' }}>
              {Object.keys(selectedAnswers).length} of {totalQuestions} answered
            </div>

            {currentQuestion === totalQuestions - 1 ? (
              <button 
                onClick={handleSubmitQuiz}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz View Mode
  if (selectedQuiz && quizMode === 'view') {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={handleCloseQuiz}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to All Quizzes
        </button>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1>{selectedQuiz.title}</h1>
          <p style={{ color: '#666', marginBottom: '10px' }}>{selectedQuiz.description}</p>
          <p style={{ marginBottom: '20px' }}>
            <strong>Total Questions:</strong> {selectedQuiz.totalQuestions}
          </p>

          {selectedQuiz.questions.map((q, index) => (
            <div key={index} style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <h3 style={{ marginBottom: '15px' }}>
                Question {index + 1}: {q.question}
              </h3>
              
              <div style={{ marginLeft: '20px', marginTop: '15px' }}>
                {q.options.map((option, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex);
                  const isCorrect = q.correctAnswer === letter;
                  
                  return (
                    <div 
                      key={optIndex} 
                      style={{ 
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: isCorrect ? '#d4edda' : '#fff',
                        border: isCorrect ? '2px solid #28a745' : '1px solid #ddd',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <strong style={{ minWidth: '30px' }}>{letter}.</strong>
                      <span>{option}</span>
                      {isCorrect && (
                        <span style={{ 
                          marginLeft: 'auto',
                          color: '#28a745',
                          fontWeight: 'bold'
                        }}>
                          ✓ Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {q.explanation && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: '#e7f3ff',
                  borderLeft: '4px solid #2196F3',
                  borderRadius: '4px'
                }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
              
              {q.difficulty && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ 
                    padding: '5px 10px',
                    backgroundColor: q.difficulty === 'easy' ? '#28a745' : q.difficulty === 'medium' ? '#ffc107' : '#dc3545',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {q.difficulty.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <h1 className="quiz-title">My Quizzes</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', fontWeight: '300' }}>
          Welcome back, {user?.username || user?.email}! Here are all your generated quizzes.
        </p>
        
        {/* Upload Section for New Quiz Generation */}
        <div className="upload-section" style={{ 
          textAlign: 'center', 
          margin: '2rem 0 3rem', 
          padding: '2rem',
          background: 'transparent'
        }}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              // Handle file upload for quiz generation
              const file = e.target.files[0];
              if (file) {
                console.log('PDF uploaded for quiz generation:', file);
                // Navigate to home page for quiz generation
                navigate('/', { state: { uploadedFile: file } });
              }
            }}
            style={{ display: 'none' }}
            id="quiz-file-input"
          />
          <label htmlFor="quiz-file-input" style={{
            display: 'inline-block',
            padding: '0.9rem 2rem',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            fontWeight: '400',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
          }}
          >
            Upload PDF to Generate New Quiz
          </label>
        </div>
      </div>

      {error && (
        <div className="quiz-container">
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: 'white', 
            padding: '1rem 1.5rem', 
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {error}
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="quiz-container">
          <div className="quiz-card" style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem' }}>No quizzes yet</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '2rem', fontSize: '1.1rem', fontWeight: '300' }}>
              Upload a PDF on the home page to generate your first quiz!
            </p>
            <button 
              onClick={() => navigate('/')}
              className="quiz-button quiz-button-primary"
              style={{
                marginTop: '0',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '500',
                borderRadius: '50px',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {quizzes.map((quiz) => (
              <div 
                key={quiz._id} 
                className="quiz-card"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.3rem', fontWeight: '600' }}>
                {quiz.title}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5', fontWeight: '300' }}>
                {quiz.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                  <strong style={{ color: 'white' }}>{quiz.totalQuestions}</strong> Questions
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '300' }}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleStartQuiz(quiz)}
                className="quiz-button quiz-button-primary"
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}
              >
                Take Quiz
              </button>
              <button 
                onClick={() => handleViewQuiz(quiz)}
                className="quiz-button"
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}
              >
                View Answers
              </button>
            </div>
          </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
