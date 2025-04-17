import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css'; 

function Chatbot() {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m MediAssist, your healthcare assistant. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionId, setSessionId] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  
  // Refs
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const analysisContentRef = useRef(null);

  // API base URL - should be configured based on environment
  const API_BASE_URL = 'http://localhost:8000' || 'http://127.0.0.1:8000';
  
  // Initialize session on component mount
  useEffect(() => {
    // Try to get existing session ID from localStorage
    const storedSessionId = localStorage.getItem('medicalChatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchSessionInfo(storedSessionId);
    }
  }, []);

  // Fetch session info if we have a session ID
  const fetchSessionInfo = async (sid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sid}`);
      if (response.ok) {
        const data = await response.json();
        // If there's a latest analysis, set it in the state
        if (data.latest_analysis) {
          setAnalysis(data.latest_analysis.analysis);
          setScanHistory(prev => [data.latest_analysis, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error fetching session info:", error);
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Toggle chatbot open/closed
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 300);
    }
  };

  // Reset scan selection
  const resetScanSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // Don't reset analysis - we keep it as part of history
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/dicom', 'application/dicom'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.dcm')) {
        showNotification('Please upload a valid medical image (JPEG, PNG, or DICOM)', 'error');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('File size exceeds 10MB limit', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload and analyze scan
  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file first', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze-scan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to analyze scan: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      // Save the session ID if we don't have one yet
      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem('medicalChatSessionId', data.session_id);
      }
      
      // Add system message to chat about the scan
      setChatMessages(prevMessages => [
        ...prevMessages,
        { 
          role: 'system', 
          content: 'I\'ve analyzed your scan. Feel free to ask me any questions about the results.' 
        }
      ]);
      
      // Add to scan history
      setScanHistory(prev => [{
        filename: selectedFile.name,
        timestamp: data.timestamp,
        analysis: data.analysis
      }, ...prev]);
      
      // Reset file selection to allow for a new upload
      resetScanSelection();
      
      // Show success notification
      showNotification('Scan analyzed successfully', 'success');
      
      // Switch to chat tab after analysis
      setActiveTab('chat');
    } catch (error) {
      console.error('Error:', error);
      showNotification(`Error analyzing scan: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Extract key insights from analysis text
  const extractKeyInsights = (analysisText) => {
    if (!analysisText) return [];
    
    const possibleInsights = [
      { keyword: "visible", label: "Visibility" },
      { keyword: "structure", label: "Structure" },
      { keyword: "normal", label: "Normal Findings" },
      { keyword: "abnormal", label: "Abnormal Findings" },
      { keyword: "contrast", label: "Contrast" },
      { keyword: "density", label: "Density" },
      { keyword: "tissue", label: "Tissue" },
      { keyword: "bones", label: "Bone Structure" },
      { keyword: "organ", label: "Organ" },
      { keyword: "brain", label: "Brain" },
      { keyword: "lung", label: "Lungs" },
      { keyword: "heart", label: "Heart" },
      { keyword: "spine", label: "Spine" },
      { keyword: "abdomen", label: "Abdomen" },
      { keyword: "quality", label: "Image Quality" }
    ];
    
    // Find sentences containing insight keywords
    const insights = [];
    const sentences = analysisText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    possibleInsights.forEach(({ keyword, label }) => {
      const matchingSentences = sentences.filter(s => 
        s.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchingSentences.length > 0) {
        insights.push({
          label,
          text: matchingSentences[0].trim() + '.'
        });
      }
    });
    
    return insights.slice(0, 5); // Limit to top 5 insights
  };

  // Send message to chat
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = { role: 'user', content: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get response: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      // Save session ID if we received one and didn't have it before
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem('medicalChatSessionId', data.session_id);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request. Please try again later.' 
        }
      ]);
      showNotification('Error sending message. Please try again.', 'error');
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  // Handle key press in chat input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Focus input when chat tab is activated
  useEffect(() => {
    if (activeTab === 'chat' && isOpen) {
      messageInputRef.current?.focus();
    }
  }, [activeTab, isOpen]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Get key insights
  const insights = extractKeyInsights(analysis);

  // Format timestamp
  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return isoString;
    }
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {notification.type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          {notification.message}
        </div>
      )}

      <div className="chatbot-icon" onClick={toggleChatbot} aria-label="Open medical assistant">
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main Circle */}
          <circle cx="12" cy="12" r="10" />
          
          {/* Brain Pattern */}
          <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          <path d="M12 8c1.5 0 2.9.6 3.9 1.6" />
          <path d="M12 16c-1.5 0-2.9-.6-3.9-1.6" />
          
          {/* Medical Cross */}
          <path d="M12 10v4M10 12h4" />
          
          {/* Connection Lines */}
          <path d="M7 9c-.3-.3-.5-.7-.6-1.1" />
          <path d="M17 9c.3-.3.5-.7.6-1.1" />
          
          {/* Pulse Line */}
          <path
            d="M8.7 15c-.4-.5-.7-1.1-.8-1.8M15.3 15c.4-.5.7-1.1.8-1.8"
            strokeDasharray="1 2"
          />
        </svg>
      </div>

      {/* Chatbot Container */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-title">
            {/* Header Logo */}
            <div className="chatbot-logo">
              <svg 
                viewBox="0 0 24 24" 
                className="w-7 h-7"
                fill="none" 
                stroke="currentColor"
              >
                <path
                  d="M18 2h-4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V3a1 1 0 00-1-1z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 2H6a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V3a1 1 0 00-1-1z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 10h-4a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 10H6a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <div className="chatbot-title">MediAssist</div>
              <div className="chatbot-subtitle">
                Healthcare Support
                {sessionId && <span className="session-indicator">•</span>}
              </div>
            </div>
          </div>
          <button className="chatbot-close" onClick={toggleChatbot} aria-label="Close chatbot">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Chatbot Tabs */}
        <div className="chatbot-tabs">
          <button 
            className={`chatbot-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            {/* Chat Tab Icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6"
              fill="none" 
              stroke="currentColor"
            >
              <path
                d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Chat
          </button>
          <button 
            className={`chatbot-tab ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            {/* Scan Analysis Tab Icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6"
              fill="none" 
              stroke="currentColor"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <path
                d="M7 12l4 4 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12h20"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4"
              />
            </svg>
            Scan Analysis
          </button>
          {scanHistory.length > 0 && (
            <button 
              className={`chatbot-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              {/* History Tab Icon */}
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6"
                fill="none" 
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  d="M12 6v6l4 2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6v6l-4 2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.5"
                />
              </svg>
              History
            </button>
          )}
        </div>

        {/* Chatbot Body */}
        <div className="chatbot-body">
          {activeTab === 'scan' ? (
            <div className="scan-tab">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/dicom,application/dicom,.dcm"
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <div className="scan-upload-section" onClick={triggerFileInput}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scan-upload-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  
                  <div className="scan-upload-text">
                    <p>Upload your medical scan</p>
                    <p>Supports JPG, PNG and DICOM images</p>
                  </div>
                  
                  <button className="scan-upload-button" onClick={triggerFileInput}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Choose File
                  </button>
                </div>
              ) : (
                <>
                  <div className="scan-upload-section">
                    <div className="scan-file-name">{selectedFile.name}</div>
                    <div className="scan-preview">
                      <img src={previewUrl} alt="Medical scan preview" />
                    </div>
                    <div className="scan-buttons">
                      <button 
                        onClick={resetScanSelection} 
                        className="cancel-button"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpload} 
                        disabled={loading}
                        className="analyze-button"
                      >
                        {loading ? (
                          <>
                            <span className="spinner"></span> Analyzing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12h6M18 12h4"></path>
                              <circle cx="12" cy="12" r="9"></circle>
                              <path d="M12 9v6M15 12h-3"></path>
                            </svg>
                            Analyze Scan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {analysis && (
                <div className="analysis-results">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    Analysis Results
                  </h3>
                  <div className="analysis-content" ref={analysisContentRef}>
                    <ReactMarkdown>
                      {analysis}
                    </ReactMarkdown>
                  </div>
                  
                  {insights.length > 0 && (
                    <div className="key-insights">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4M12 8h.01"></path>
                        </svg>
                        Key Insights
                      </h4>
                      <div className="insights-list">
                        {insights.map((insight, index) => (
                          <div key={index} className="insight-item">
                            <div className="insight-label">{insight.label}</div>
                            <div className="insight-text">{insight.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    className="next-steps-button"
                    onClick={() => setActiveTab('chat')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Ask Questions About Results
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="history-tab">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Scan History
              </h3>
              
              {scanHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No scan history available yet</p>
                </div>
              ) : (
                <div class="history-list">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="history-item">
                      <div className="history-item-header">
                        <div className="history-item-title">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          {scan.filename}
                        </div>
                        <div className="history-item-date">
                          {formatTimestamp(scan.timestamp)}
                        </div>
                      </div>
                      <div className="history-item-preview">
                        <div className="history-analysis-summary">
                          {scan.analysis.split(/[.!?]+/)[0].trim()}.
                        </div>
                        <button 
                          className="history-view-button"
                          onClick={() => {
                            setAnalysis(scan.analysis);
                            setActiveTab('scan');
                          }}
                        >
                          View Full Analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="chat-tab">
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${
                      msg.role === 'user' 
                        ? 'user-message' 
                        : msg.role === 'system' 
                          ? 'system-message' 
                          : 'assistant-message'
                    }`}
                  >
                    {msg.role !== 'system' && (
                      <div className="message-avatar">
                        {msg.role === 'user' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                          </svg>
                        )}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="markdown-content">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="message assistant-message">
                    <div className="message-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="chat-input-area">
                <textarea
                  ref={messageInputRef}
                  className="chat-input"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your medical question here..."
                  onKeyPress={handleKeyPress}
                  disabled={chatLoading}
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={chatLoading || !currentMessage.trim()}
                  className="chat-send-button"
                  aria-label="Send message"
                >
                  {/* Send Message Button */}
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5"
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path
                      d="M22 2L11 13"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2l-7 20-4-9-9-4 20-7z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Chatbot Footer */}
        <div className="chatbot-footer">
          <div className="disclaimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4M12 16h.01"></path>
            </svg>
            This is not a substitute for professional medical advice. Always consult with qualified healthcare providers.
          </div>
          {sessionId && (
            <div className="session-info">
              Session ID: {sessionId.substring(0, 8)}...
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Chatbot;