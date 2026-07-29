import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Send, FileText, Trash2 } from 'lucide-react';
import { API, apiPost, apiGet, apiDelete, apiPostFormData } from '../api/config';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  fileName?: string;
  sources?: string[];
}

interface Document {
  doc_id: string;
  doc_name: string;
  total_chunks: number;
}

const ChatBotWithFileUpload: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Upload a PDF or text file, then ask me anything about it. I'll answer based on the document content.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showDocs, setShowDocs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const data = await apiGet<{ documents: Document[] }>(API.RAG_DOCUMENTS);
      setDocuments(data.documents || []);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const uploadFile = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiPostFormData(API.RAG_UPLOAD, formData);
      await fetchDocuments();
      return true;
    } catch (e: any) {
      console.error('Upload error:', e);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Failed to upload "${file.name}": ${e.message || 'Unknown error'}`,
        isUser: false,
        timestamp: new Date()
      }]);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessageToAPI = async (message: string): Promise<{ text: string; sources: string[] }> => {
    try {
      const data = await apiPost<{ text: string; sources: string[] }>(API.RAG_CHAT, { text: message });
      return { text: data.text || 'Sorry, I could not process your request.', sources: data.sources || [] };
    } catch (error) {
      console.error('API Error:', error);
      return { text: 'Sorry, I\'m having trouble connecting to the server. Please try again later.', sources: [] };
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedFile) || isLoading) return;

    const currentFile = selectedFile;
    const currentMessage = inputMessage.trim();

    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    if (currentFile) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Uploading "${currentFile.name}"...`,
        isUser: true,
        timestamp: new Date(),
        fileName: currentFile.name
      }]);

      const uploaded = await uploadFile(currentFile);
      if (!uploaded) {
        setIsLoading(false);
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `"${currentFile.name}" uploaded and indexed successfully! You can now ask questions about it.`,
        isUser: false,
        timestamp: new Date()
      }]);

      if (!currentMessage) {
        setIsLoading(false);
        return;
      }
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date()
    }]);

    const response = await sendMessageToAPI(currentMessage);

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      text: response.text,
      isUser: false,
      timestamp: new Date(),
      sources: response.sources.length > 0 ? response.sources : undefined
    }]);

    setIsLoading(false);
  };

  const handleDeleteDoc = async (docId: string, docName: string) => {
    try {
      await apiDelete(API.RAG_DELETE_DOC(docId));
      await fetchDocuments();
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Deleted document "${docName}" from knowledge base.`,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (e: any) {
      console.error('Delete error:', e);
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
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        marginTop: '5vh'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              padding: '12px',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}>
              <FileText size={24} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                RAG Document Chat
              </h1>
              <p style={{ color: '#9ca3af', margin: '4px 0 0 0' }}>
                Upload documents, then ask questions about their content
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDocs(!showDocs)}
            style={{
              padding: '10px 16px',
              background: showDocs ? 'rgba(59, 130, 246, 0.3)' : 'rgba(55, 65, 81, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FileText size={16} />
            Documents ({documents.length})
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '16px', padding: '16px', height: '75vh' }}>
        {/* Documents Panel */}
        {showDocs && (
          <div style={{
            width: '280px',
            flexShrink: 0,
            background: 'rgba(31, 41, 59, 0.8)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#d1d5db' }}>
              Uploaded Documents
            </h3>
            {documents.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No documents uploaded yet. Drop a file below to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map(doc => (
                  <div key={doc.doc_id} style={{
                    padding: '10px 12px',
                    background: 'rgba(55, 65, 81, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.doc_name}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                        {doc.total_chunks} chunks
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.doc_id, doc.doc_name)}
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(31, 41, 59, 0.6)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  maxWidth: '75%',
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
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    {message.isUser ? '👤' : '🤖'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      borderRadius: '18px',
                      borderBottomRightRadius: message.isUser ? '6px' : '18px',
                      borderBottomLeftRadius: message.isUser ? '18px' : '6px',
                      padding: '12px 16px',
                      background: message.isUser
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(55, 65, 81, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
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
                          <FileText size={16} color="#60a5fa" />
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>{message.fileName}</span>
                        </div>
                      )}

                      <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </p>

                      {message.sources && message.sources.length > 0 && (
                        <div style={{
                          marginTop: '10px',
                          padding: '8px 10px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                          <p style={{ margin: 0, fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>
                            Sources:
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                            {message.sources.join(', ')}
                          </p>
                        </div>
                      )}
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
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', animation: 'pulse 2s infinite'
                  }}>
                    🤖
                  </div>
                  <div style={{
                    background: 'rgba(55, 65, 81, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px', borderBottomLeftRadius: '6px',
                    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out' }}></div>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out 0.2s' }}></div>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out 0.4s' }}></div>
                    <span style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: '500', marginLeft: '4px' }}>
                      {isUploading ? 'Uploading...' : 'AI is thinking...'}
                    </span>
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
                marginBottom: '16px', padding: '12px',
                background: 'rgba(55, 65, 81, 0.5)', borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={24} color="#60a5fa" />
                  <div>
                    <p style={{ fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFile(null)} style={{ padding: '8px', color: '#9ca3af', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', borderRadius: '6px' }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Drag and Drop */}
            <div
              style={{
                marginBottom: '16px',
                border: dragActive ? '2px dashed #60a5fa' : '2px dashed #4b5563',
                borderRadius: '12px', padding: '16px', textAlign: 'center',
                transition: 'all 0.3s ease',
                background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload size={20} style={{ margin: '0 auto 6px auto', color: dragActive ? '#60a5fa' : '#9ca3af', display: 'block' }} />
              <p style={{ color: '#9ca3af', margin: '0 0 6px 0', fontSize: '13px' }}>
                {dragActive ? 'Drop your file here' : 'Drag & drop a PDF/TXT file'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', fontSize: '12px', fontFamily: 'inherit' }}
              >
                or browse to upload
              </button>
              <input ref={fileInputRef} type="file" onChange={handleFileInputChange} style={{ display: 'none' }} accept=".pdf,.txt,.text" />
            </div>

            {/* Input Row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about your document..."
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(55, 65, 81, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px', color: 'white', fontSize: '14px',
                    fontFamily: 'inherit', resize: 'none', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  rows={2}
                  disabled={isLoading}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                style={{
                  padding: '12px 16px', borderRadius: '12px', border: 'none',
                  cursor: (!inputMessage.trim() && !selectedFile) || isLoading ? 'not-allowed' : 'pointer',
                  background: (!inputMessage.trim() && !selectedFile) || isLoading
                    ? 'rgba(75, 85, 99, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: (!inputMessage.trim() && !selectedFile) || isLoading ? '#9ca3af' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <Send size={20} />
              </button>
            </div>

            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
              Upload PDF/TXT files to build knowledge base. Ask questions to get AI-powered answers.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ChatBotWithFileUpload;
