import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Send, Paperclip } from 'lucide-react';
import { API } from '../api/config';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  fileName?: string;
  fileType?: string;
}

const ChatBotWithFileUpload: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. You can send me text messages or upload files along with your questions. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessageToAPI = async (message: string, file?: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('text', message);
      
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(API.CHECK_COLLEGE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || 'Sorry, I could not process your request at the moment.';
    } catch (error) {
      console.error('API Error:', error);
      return 'Sorry, I\'m having trouble connecting to the server. Please try again later.';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedFile) || isLoading) return;

    const messageText = inputMessage.trim() || (selectedFile ? 'File uploaded' : '');
    
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      fileName: selectedFile?.name,
      fileType: selectedFile?.type
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    const currentFile = selectedFile;
    
    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const botResponse = await sendMessageToAPI(currentMessage, currentFile || undefined);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your message. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📕';
    return '📎';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827, #1f2937, #111827)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
      paddingTop: '20px'
    }}>
      
      {/* Header */}
      <div style={{
        background: 'rgba(31, 41, 59, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        marginTop:'5vh'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            padding: '12px',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}>
            🤖
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: ''
            }}>
              AI ChatBot with File Upload
            </h1>
            <p style={{
              color: '#9ca3af',
              marginTop: '8px',
              margin: '8px 0 0 0'
            }}>
              Send messages and upload files to get AI assistance
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
          paddingTop:'5vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(31, 41, 59, 0.6)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((message, index) => (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
              }}>
                <div style={{
                  maxWidth: '70%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '12px',
                  flexDirection: message.isUser ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: message.isUser 
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                      : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {message.isUser ? '👤' : '🤖'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      borderRadius: '18px',
                      borderBottomRightRadius: message.isUser ? '6px' : '18px',
                      borderBottomLeftRadius: message.isUser ? '18px' : '6px',
                      padding: '12px 16px',
                      background: message.isUser 
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(55, 65, 81, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      
                      {/* File Info */}
                      {message.fileName && (
                        <div style={{
                          marginBottom: '8px',
                          padding: '8px',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>{getFileIcon(message.fileType)}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontWeight: '500',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>{message.fileName}</p>
                          </div>
                        </div>
                      )}
                      
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        margin: 0
                      }}>{message.text}</p>
                    </div>
                    
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '4px',
                      textAlign: message.isUser ? 'right' : 'left'
                    }}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Message */}
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    animation: 'pulse 2s infinite'
                  }}>
                    🤖
                  </div>
                  <div style={{
                    background: 'rgba(55, 65, 81, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px',
                    borderBottomLeftRadius: '6px',
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '4px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                        }}></div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: '#d1d5db'
                      }}>Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px'
          }}>
            
            {/* Selected File */}
            {selectedFile && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(55, 65, 81, 0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>{getFileIcon(selectedFile.type)}</span>
                    <div>
                      <p style={{
                        fontWeight: '500',
                        color: 'white',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{selectedFile.name}</p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: 0
                      }}>{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    style={{
                      padding: '8px',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Drag and Drop */}
            <div
              style={{
                marginBottom: '16px',
                border: dragActive ? '2px dashed #60a5fa' : '2px dashed #4b5563',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload 
                size={24} 
                style={{
                  margin: '0 auto 8px auto',
                  color: dragActive ? '#60a5fa' : '#9ca3af',
                  display: 'block'
                }}
              />
              <p style={{
                color: '#9ca3af',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                {dragActive ? 'Drop your file here' : 'Drag and drop a file here, or'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  color: '#60a5fa',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                browse to upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                accept="*/*"
              />
            </div>

            {/* Input Row */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  style={{
                    width: '85%',
                    padding: '12px 16px',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  rows={3}
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '12px',
                  background: 'rgba(55, 65, 81, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                }}
              >
                <Paperclip size={20} />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: (!inputMessage.trim() && !selectedFile) || isLoading ? 'not-allowed' : 'pointer',
                  background: (!inputMessage.trim() && !selectedFile) || isLoading
                    ? 'rgba(75, 85, 99, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: (!inputMessage.trim() && !selectedFile) || isLoading ? '#9ca3af' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: (!inputMessage.trim() && !selectedFile) || isLoading ? 'none' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!((!inputMessage.trim() && !selectedFile) || isLoading)) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((!inputMessage.trim() && !selectedFile) || isLoading)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <Send size={20} />
              </button>
            </div>

            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Press Enter to send • Upload files up to your server limit
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 
          40% {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBotWithFileUpload;