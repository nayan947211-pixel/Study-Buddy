import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectToken } from "../features/authSlice";
import axios from "axios";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadedContext, setUploadedContext] = useState(null);
  const messagesEndRef = useRef(null);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        "http://localhost:3000/api/pdf/getData",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setUploadedContext(response.data.data.text);
        setFile(selectedFile);
        setMessages([...messages, {
          role: 'system',
          content: `📄 Document uploaded: ${selectedFile.name}. You can now ask questions about this document!`
        }]);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/chat/ask',
        {
          question: userMessage,
          context: uploadedContext
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.data.answer
        }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">💬 AI Tutor Chat</h1>
          <p className="chat-subtitle">Ask questions about your study materials</p>
          <div className="upload-context">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="chat-file-input"
            />
            <label htmlFor="chat-file-input" className="upload-context-btn">
              {file ? `📄 ${file.name}` : '📤 Upload Document for Context'}
            </label>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="empty-icon">🤖</div>
              <h3>Hello! I'm your AI study buddy</h3>
              <p>Upload a document or ask me anything about your studies!</p>
              <div className="sample-questions">
                <p><strong>Try asking:</strong></p>
                <ul>
                  <li>"Explain this concept to me"</li>
                  <li>"Give me an example of..."</li>
                  <li>"What are the key points?"</li>
                  <li>"Can you summarize this topic?"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : message.role === 'system' ? '📢' : '🤖'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
