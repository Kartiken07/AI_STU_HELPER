import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormattedText } from './FormattedText';
import { API, apiGet, apiPost } from '../api/config';

// Types
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface UserInfo {
  name: string;
  interests: string[];
  location?: string;
  isNameCollected: boolean;
  isLocationCollected: boolean;
  isInterestsCollected: boolean;
}

// Chatbot Component
const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { initialBotMessage?: string, interestsFromQuiz?: any } };
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    const userId = localStorage.getItem('currentUserId') || 'guest';
    try {
      const saved = localStorage.getItem(`chat_userInfo_${userId}`);
      if (saved) return JSON.parse(saved) as UserInfo;
    } catch {}
    return {
      name: '',
      interests: [],
      location: '',
      isNameCollected: false,
      isLocationCollected: false,
      isInterestsCollected: false
    };
  });
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUserId = Number(localStorage.getItem('currentUserId') || '0');

  // Utilities: persist structured dashboard links and user selections
  const mergeDashboardBuckets = (userKey: string, partial: any) => {
    try {
      const raw = localStorage.getItem(userKey);
      const prev = raw ? JSON.parse(raw) : {};
      const next = {
        colleges: [...(prev.colleges || []), ...(partial.colleges || [])],
        courses: [...(prev.courses || []), ...(partial.courses || [])],
        scholarships: [...(prev.scholarships || []), ...(partial.scholarships || [])],
        internships: [...(prev.internships || []), ...(partial.internships || [])],
        books: [...(prev.books || []), ...(partial.books || [])],
        materials: [...(prev.materials || []), ...(partial.materials || [])]
      };
      // de-duplicate by url+title
      const dedupe = (arr: any[]) => {
        const seen = new Set<string>();
        return arr.filter(x => {
          const key = (x.url || '') + '|' + (x.title || '');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };
      next.colleges = dedupe(next.colleges);
      next.courses = dedupe(next.courses);
      next.scholarships = dedupe(next.scholarships);
      next.internships = dedupe(next.internships);
      next.books = dedupe(next.books);
      next.materials = dedupe(next.materials);
      localStorage.setItem(userKey, JSON.stringify(next));
    } catch {}
  };

  const extractLinksBuckets = (text: string) => {
    const buckets: any = { colleges: [], courses: [], scholarships: [], internships: [], books: [], materials: [] };
    try {
      const urlRegex = /(https?:\/\/[^\s)]+)[)\s]?/gim;
      const lines = text.split(/\n|\r/);
      for (const line of lines) {
        const lower = line.toLowerCase();
        let match;
        while ((match = urlRegex.exec(line)) !== null) {
          const url = match[1];
          const title = line.replace(url, '').replace(/[-*•:–—]/g, '').trim() || url;
          const item = { title, url };
          if (lower.includes('college') || lower.includes('university')) buckets.colleges.push(item);
          else if (lower.includes('scholar')) buckets.scholarships.push(item);
          else if (lower.includes('intern')) buckets.internships.push(item);
          else if (lower.includes('book')) buckets.books.push(item);
          else if (lower.includes('course')) buckets.courses.push(item);
          else if (lower.includes('material') || lower.includes('resource') || lower.includes('study')) buckets.materials.push(item);
          else buckets.materials.push(item);
        }
      }
    } catch {}
    return buckets;
  };

  // Helper: persist dashboard plan steered by chatbot
  const commitDashboardPlan = (focusStream: string, focusDegree: string, recs?: any) => {
    try {
      localStorage.setItem('dashboard_focus_stream', focusStream);
      localStorage.setItem('dashboard_focus_degree', focusDegree);
      if (recs) {
        localStorage.setItem('dashboard_recommendations', JSON.stringify(recs));
      }
    } catch {}
    const notify: Message = {
      id: Date.now() + 3,
      text: "Got your information. Processing your plan now… Please open the Dashboard to see your updated roadmap, recommendations, and tasks.",
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, notify]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Load messages from localStorage on mount (before greeting injection)
  useEffect(() => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'guest';
      const raw = localStorage.getItem(`chat_messages_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
        const revived: Message[] = parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        if (revived.length > 0) setMessages(revived);
      }
    } catch {}
  }, []);

  // Load messages from backend history for logged-in user (overrides local cache)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!currentUserId) return;
        const data: any = await apiGet(API.CHAT_HISTORY, { user_id: currentUserId, limit: 50 });
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          const revived: Message[] = data.messages.map((m: any) => ({
            id: m.id || Date.now(),
            text: m.text,
            isUser: !!m.isUser,
            timestamp: new Date(m.timestamp || new Date().toISOString())
          }));
          setMessages(revived);
        }
      } catch (e) {
        console.warn('Failed to load history:', e);
      }
    };
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages whenever they change
  useEffect(() => {
    try {
      const serializable = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
      const userId = localStorage.getItem('currentUserId') || 'guest';
      localStorage.setItem(`chat_messages_${userId}`, JSON.stringify(serializable));
    } catch {}
  }, [messages]);


  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Persist user info
  useEffect(() => {
    try {
      const userId = localStorage.getItem('currentUserId') || 'guest';
      localStorage.setItem(`chat_userInfo_${userId}`, JSON.stringify(userInfo));
    } catch {}
  }, [userInfo]);

  // If we navigated from quiz with a status message, prepend it once; also set interests and auto-reply
  useEffect(() => {
    // Show initial status message if provided
    if (location?.state?.initialBotMessage) {
      const botMessage: Message = {
        id: Date.now() + 100,
        text: location.state.initialBotMessage,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [botMessage, ...prev]);
      // Heuristic: if scores present, preselect stream
      try {
        const q = location.state.initialBotMessage.toLowerCase();
        if (q.includes('science') || q.includes('pcm') || q.includes('pcb') || q.includes('engineering')) {
          commitDashboardPlan('engineering', 'B.Tech');
        } else if (q.includes('commerce')) {
          commitDashboardPlan('commerce', 'B.Com');
        } else if (q.includes('arts')) {
          commitDashboardPlan('arts', 'B.A.');
        } else if (q.includes('medical')) {
          commitDashboardPlan('medical', 'MBBS');
        }
      } catch {}
    }

    if (location?.state?.interestsFromQuiz) {
      const quiz = location.state.interestsFromQuiz;
      // Derive top interests labels
      const interestPairs: Array<[string, number]> = [
        ['science', Number(quiz.interest_science) || 0],
        ['arts', Number(quiz.interest_arts) || 0],
        ['commerce', Number(quiz.interest_commerce) || 0]
      ];
      interestPairs.sort((a,b) => b[1]-a[1]);
      const topInterests = interestPairs
        .filter(([,score]) => score > 0)
        .slice(0, 2)
        .map(([key]) => key);

      setUserInfo(prev => ({
        ...prev,
        interests: topInterests,
        isInterestsCollected: true,
        isNameCollected: prev.isNameCollected
      }));
      setShowAssessmentPrompt(false);

      // Auto-response tailored to quiz results
      const suggestionText = `Based on your assessment, your strengths lean towards ${topInterests.join(' and ')}. I recommend exploring roles and paths that fit these areas. Would you like a curated list of careers and colleges tailored to ${topInterests.join(' and ')}?`;
      const autoMessage: Message = {
        id: Date.now() + 101,
        text: suggestionText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoMessage]);
    }

    // If no name is collected and no special message, show greeting once
    if (!location?.state?.initialBotMessage && !userInfo.isNameCollected) {
      const greeting: Message = {
        id: Date.now() + 1,
        text: "Hello! I'm your Student Career Helper. To provide you with the best personalized guidance, I'd love to get to know you better. What's your name?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => (prev.length === 0 ? [greeting] : prev));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatResponse = (response: string): string => {
    return response.trim();
  };

  // Map of example colleges by city (can be moved to backend later)
  const collegesByCity: Record<string, string[]> = {
    delhi: ['IIT Delhi', 'Delhi University', 'IIIT Delhi'],
    mumbai: ['IIT Bombay', 'University of Mumbai', 'VJTI'],
    bangalore: ['IISc Bangalore', 'RV College of Engineering', 'BMSCE'],
    hyderabad: ['IIIT Hyderabad', 'Osmania University', 'JNTU Hyderabad'],
    chennai: ['IIT Madras', 'Anna University', 'SSN College of Engineering'],
    kolkata: ['Jadavpur University', 'IEM Kolkata', 'University of Calcutta'],
    pune: ['COEP', 'Pune University (SPPU)', 'PCCOE']
  };

  const getCollegesForCity = (cityRaw?: string): string[] => {
    if (!cityRaw) return [];
    const key = cityRaw.trim().toLowerCase();
    for (const k of Object.keys(collegesByCity)) {
      if (key.includes(k)) return collegesByCity[k];
    }
    return ['Top National Institutes (IITs/NITs)', 'Top State Universities', 'Local Accredited Colleges'];
  };

  const pushCollegesMessageIfAvailable = (city?: string) => {
    const colleges = getCollegesForCity(city);
    if (colleges.length === 0) return;
    const html = `<div class="formatted-response"><h4>Colleges in ${city}</h4>${colleges
      .map(c => `<div class=\"bullet-item\">${c}</div>`)
      .join('')}</div>`;
    const botMessage: Message = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: html,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  // Handle conversation flow
  const handleConversationFlow = (userMessage: string): string => {
    if (!userInfo.isNameCollected) {
      // Collect name
      setUserInfo(prev => ({ ...prev, name: userMessage.trim(), isNameCollected: true }));
      return `Nice to meet you, ${userMessage.trim()}! Which city are you from? I can show colleges in your area.`;
    } else if (!userInfo.isLocationCollected) {
      // Collect location, then ask interests
      const location = userMessage.trim();
      setUserInfo(prev => ({ ...prev, location, isLocationCollected: true }));
      // Only show assessment prompt if interests not already collected (i.e., not coming from quiz)
      if (!userInfo.isInterestsCollected) {
        setShowAssessmentPrompt(true);
      }
      return `Great! Noted ${location}. Now, tell me about your interests. What are your main areas of interest? (e.g., technology, arts, science, business, etc.)`;
    } else if (!userInfo.isInterestsCollected) {
      // Collect interests
      const interests = userMessage.trim().split(',').map(interest => interest.trim()).filter(interest => interest.length > 0);
      setUserInfo(prev => ({ ...prev, interests, isInterestsCollected: true }));
      // Also push colleges for the user's location
      pushCollegesMessageIfAvailable(userInfo.location);
      return `Great! I can see you're interested in ${interests.join(', ')}. Based on your interests, I can help you explore career paths, suggest colleges, prepare for interviews, or provide guidance on any career-related questions. What would you like to know more about?`;
    } else {
      // Regular conversation with personalized context
      return `Thanks for sharing that, ${userInfo.name}! Based on your interests in ${userInfo.interests.join(', ')}, I'd be happy to help you with career guidance. What specific question do you have?`;
    }
  };

  const askInterestsAfterDecline = () => {
    setShowAssessmentPrompt(false);
    const promptText = `No problem, ${userInfo.name}! I'd love to know your interests. What are your main areas of interest or subjects you enjoy? (e.g., technology, arts, science, business, etc.)`;
    const botMessage: Message = {
      id: Date.now() + 2,
      text: promptText,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const startQuizNow = () => {
    setShowAssessmentPrompt(false);
    navigate('/quiz');
  };

  // API call to FastAPI backend
  const sendMessageToAPI = async (message: string): Promise<string> => {
    try {
      // Prepare last 20 messages as history for LangChain
      const history = messages.slice(-20).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
      const data: any = await apiPost(API.CHAT, {
        'text': message,
        'format_response': true,
        'user_name': userInfo.name,
        'user_interests': userInfo.interests,
        'history': history,
        'user_id': currentUserId || null
      });
      return data.text || 'Sorry, I could not process your request at the moment.';
    } catch (error) {
      console.error('API Error:', error);
      return 'Sorry, I\'m having trouble connecting to the server. Please try again later.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Heuristic: pick up stream from user message keywords
    const msgLower = currentMessage.toLowerCase();
    if (/(engineering|btech|b\.tech)/.test(msgLower)) {
      commitDashboardPlan('engineering', 'B.Tech');
    } else if (/(medical|mbbs|medicine)/.test(msgLower)) {
      commitDashboardPlan('medical', 'MBBS');
    } else if (/(commerce|bcom|b\.com)/.test(msgLower)) {
      commitDashboardPlan('commerce', 'B.Com');
    } else if (/(arts|ba|b\.a)/.test(msgLower)) {
      commitDashboardPlan('arts', 'B.A.');
    }

    try {
      let botResponse: string;
      
      // Check if we're still in the initial conversation flow
      if (!userInfo.isNameCollected || !userInfo.isInterestsCollected) {
        // Use conversation flow for initial questions
        botResponse = handleConversationFlow(currentMessage);
      } else {
        // Use API for regular conversation with personalized context
        const personalizedMessage = `User: ${userInfo.name}, Interests: ${userInfo.interests.join(', ')}, Question: ${currentMessage}`;
        const apiResponse = await sendMessageToAPI(personalizedMessage);
        // Heuristic: detect recommendations in AI response and store placeholders
        try {
          const aiLower = apiResponse.toLowerCase();
          if (aiLower.includes('engineering') || aiLower.includes('b.tech')) {
            commitDashboardPlan('engineering', 'B.Tech', {
              colleges: getCollegesForCity(userInfo.location),
              courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech ME'],
              scholarships: ['National Scholarship Portal'],
              internships: ['Summer Internship - Local Tech NGO']
            });
          }
          // Extract and persist any links the AI returned
          const buckets = extractLinksBuckets(apiResponse);
          const userKey = `dashboard_link_buckets_${localStorage.getItem('currentUserId') || 'guest'}`;
          mergeDashboardBuckets(userKey, buckets);
        } catch {}
        botResponse = formatResponse(apiResponse);
      }
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      // If user expressed colleges of interest, persist them
      try {
        const userIdKey = localStorage.getItem('currentUserId') || 'guest';
        const userMessageLower = currentMessage.toLowerCase();
        if (userMessageLower.includes('college') || userMessageLower.includes('universit')) {
          // naive parse: split by comma and persist as plain names
          const names = currentMessage.split(/:|\n|,|;|\|/).map(s => s.trim()).filter(s => s.length > 1 && /[a-z]/i.test(s));
          const raw = localStorage.getItem(`dashboard_user_colleges_${userIdKey}`);
          const prev: string[] = raw ? JSON.parse(raw) : [];
          const merged = Array.from(new Set([...prev, ...names])).slice(0, 50);
          localStorage.setItem(`dashboard_user_colleges_${userIdKey}`, JSON.stringify(merged));
        }
      } catch {}
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Styles
  const chatContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1e293b 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    position: 'relative'
  };

  const chatHeaderStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)',
    borderBottom: '2px solid rgba(59, 130, 246, 0.4)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
    position: 'relative'
  };

  const botIconStyles: React.CSSProperties = {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
  };

  const messagesContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '28px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1e293b 50%, #0f172a 100%)',
    position: 'relative'
  };

  const messageStyles = (isUser: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '24px',
    justifyContent: isUser ? 'flex-end' : 'flex-start'
  });

  const messageBubbleStyles = (isUser: boolean): React.CSSProperties => ({
    maxWidth: '80%',
    padding: '20px 24px',
    borderRadius: '28px',
    background: isUser 
      ? 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' 
      : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: isUser ? 'none' : '2px solid rgba(59, 130, 246, 0.4)',
    color: 'white',
    fontSize: '16px',
    lineHeight: '1.7',
    wordWrap: 'break-word',
    borderTopLeftRadius: isUser ? '28px' : '12px',
    borderTopRightRadius: isUser ? '12px' : '28px',
    boxShadow: isUser 
      ? '0 12px 35px rgba(59, 130, 246, 0.5), 0 6px 20px rgba(0,0,0,0.2)' 
      : '0 12px 35px rgba(0,0,0,0.4), 0 6px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    animation: 'messageSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)',
    opacity: 1,
    position: 'relative',
    backdropFilter: 'blur(15px)',
    fontWeight: '400'
  });

  const avatarStyles = (isUser: boolean): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: isUser 
      ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)' 
      : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
    marginTop: '2px',
    boxShadow: isUser 
      ? '0 6px 20px rgba(107, 114, 128, 0.4)' 
      : '0 6px 20px rgba(59, 130, 246, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    animation: 'float 3s ease-in-out infinite'
  });

  const timestampStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#888888',
    marginTop: '6px',
    fontStyle: 'italic'
  };

  const inputContainerStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1e293b 100%)',
    borderTop: '2px solid rgba(59, 130, 246, 0.4)',
    padding: '24px',
    display: 'flex',
    gap: '18px',
    alignItems: 'flex-end',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 -4px 20px rgba(59, 130, 246, 0.1)'
  };

  const inputWrapperStyles: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    minWidth: 0,
    width: '100%'
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '30px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
  };

  const sendButtonStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    transform: 'scale(1)',
    animation: 'pulse 2s infinite'
  };

  const loadingContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0'
  };

  const loadingDotStyles: React.CSSProperties = {
    width: '10px',
    height: '10px',
    backgroundColor: '#8b5cf6',
    borderRadius: '50%',
    display: 'inline-block',
    margin: '0 3px',
    animation: 'typingBounce 1.4s infinite ease-in-out'
  };

  const typingIndicatorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '20px',
    border: '1px solid #404040',
    maxWidth: '120px',
    margin: '8px 0'
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#666666',
    textAlign: 'center',
    marginTop: '8px',
    fontStyle: 'italic'
  };

  const quickActionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const quickActionButtonStyles: React.CSSProperties = {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '20px',
    padding: '8px 16px',
    color: '#3b82f6',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={chatContainerStyles} className="chat-container">
      {/* Chat Header */}
      <div style={chatHeaderStyles}>
        <div style={botIconStyles}>🤖</div>
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>
            Career Assistant
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Your personal guide for career development and educational planning
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={messagesContainerStyles}>
        {messages.map((message) => (
          <div key={message.id} style={messageStyles(message.isUser)}>
            {!message.isUser && (
              <div style={avatarStyles(false)} className="avatar">🤖</div>
            )}
            
            <div>
              <div style={messageBubbleStyles(message.isUser)} className={`message-bubble ${message.isUser ? 'user-message' : ''}`}>
                {message.isUser ? (
                  message.text
                ) : (
                  <FormattedText text={message.text} />
                )}
              </div>
              <div style={timestampStyles}>
                {formatTime(message.timestamp)}
              </div>
            </div>

            {message.isUser && (
              <div style={avatarStyles(true)} className="avatar">👤</div>
            )}
          </div>
        ))}

        {showAssessmentPrompt && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '16px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
            }}>
              <div style={{ marginBottom: '12px' }}>
                Would you like to take the quiz now?
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={askInterestsAfterDecline}
                  style={{
                    ...quickActionButtonStyles,
                    color: '#f87171',
                    borderColor: 'rgba(248,113,113,0.4)',
                    background: 'rgba(248,113,113,0.12)'
                  }}
                >
                  Not now
                </button>
                <button
                  onClick={startQuizNow}
                  style={{
                    ...quickActionButtonStyles,
                    color: '#34d399',
                    borderColor: 'rgba(52,211,153,0.5)',
                    background: 'rgba(52,211,153,0.15)'
                  }}
                >
                  Yes, start quiz
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div style={messageStyles(false)}>
            <div style={avatarStyles(false)}>🤖</div>
            <div>
              <div style={typingIndicatorStyles}>
                <div style={loadingContainerStyles}>
                  <div style={loadingDotStyles}></div>
                  <div style={{...loadingDotStyles, animationDelay: '0.2s'}}></div>
                  <div style={{...loadingDotStyles, animationDelay: '0.4s'}}></div>
                </div>
                <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '500' }}>
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Only show after initial conversation */}
      {userInfo.isNameCollected && userInfo.isInterestsCollected && (
        <div style={quickActionsStyles}>
          <button 
            style={quickActionButtonStyles}
            onClick={() => setInputMessage("What career options are available for me?")}
            className="quick-action-btn"
          >
            💼 Career Options
          </button>
          <button 
            style={quickActionButtonStyles}
            onClick={() => setInputMessage("Help me choose the right college")}
            className="quick-action-btn"
          >
            🎓 College Selection
          </button>
          <button 
            style={quickActionButtonStyles}
            onClick={() => setInputMessage("How can I improve my resume?")}
            className="quick-action-btn"
          >
            📄 Resume Tips
          </button>
          <button 
            style={quickActionButtonStyles}
            onClick={() => { commitDashboardPlan('engineering','B.Tech'); }}
            className="quick-action-btn"
          >
            ⚙️ Set Focus: Engineering (B.Tech)
          </button>
        </div>
      )}

      {/* Input Area */}
      <div style={inputContainerStyles}>
        <div style={inputWrapperStyles}>
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !userInfo.isNameCollected 
                ? "Enter your name..." 
                : !userInfo.isInterestsCollected 
                ? "Tell me about your interests..." 
                : "Ask me about careers, colleges, interviews, resumes, or job search tips..."
            }
            disabled={isLoading}
            className="input-field"
            style={{
              ...inputStyles,
              borderColor: inputMessage.trim() ? '#4f46e5' : '#444444',
              boxShadow: inputMessage.trim() ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4f46e5';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              if (!inputMessage.trim()) {
                e.currentTarget.style.borderColor = '#444444';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          <div style={helperTextStyles}>
            Press Enter to send • {
              !userInfo.isNameCollected 
                ? "Let's get to know each other!" 
                : !userInfo.isInterestsCollected 
                ? "Share your interests for better guidance" 
                : "Get personalized career guidance"
            }
          </div>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
          style={{
            ...sendButtonStyles,
            background: (!inputMessage.trim() || isLoading) ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)' : 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
            cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
            boxShadow: (!inputMessage.trim() || isLoading) ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && inputMessage.trim()) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && inputMessage.trim()) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        @keyframes messageSlideIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
          }
        }
        
        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        html, body {
          overflow-x: hidden;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .feature-button:hover {
          transform: translateY(-3px) scale(1.05);
          background: rgba(255,255,255,0.15);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }
        
        .send-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }
        
        .input-field:focus {
          animation: glow 2s infinite;
          border-color: #60a5fa;
          box-shadow: 0 0 25px rgba(96, 165, 250, 0.4), 0 4px 20px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        
        .chat-container {
          animation: glowPulse 4s ease-in-out infinite;
        }
        
        .message-bubble:not(.user-message) {
          position: relative;
          overflow: hidden;
        }
        
        .message-bubble:not(.user-message)::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .quick-action-btn:hover {
          transform: translateY(-2px) scale(1.05);
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .message-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.2);
        }
        
        .avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
        }
        
        .formatted-response {
          line-height: 1.8;
          font-size: 16px;
        }
        
        .formatted-response strong {
          color: #60a5fa;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
        }
        
        .formatted-response em {
          color: #a7f3d0;
          font-style: italic;
          font-weight: 500;
        }
        
        .formatted-response .numbered-item {
          margin: 12px 0;
          padding: 16px 20px;
          border-left: 4px solid #60a5fa;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .formatted-response .numbered-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #60a5fa, #10b981, #60a5fa);
        }
        
        .formatted-response .bullet-item {
          margin: 10px 0;
          padding: 12px 20px 12px 30px;
          position: relative;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }
        
        .formatted-response .bullet-item::before {
          content: "▶";
          color: #60a5fa;
          font-weight: bold;
          position: absolute;
          left: 12px;
          top: 12px;
          font-size: 12px;
        }
        
        .formatted-response .paragraph {
          margin: 16px 0;
          padding: 8px 0;
        }
        
        .formatted-response h3 {
          color: #60a5fa;
          margin: 20px 0 12px 0;
          font-size: 18px;
          font-weight: 700;
          text-shadow: 0 0 15px rgba(96, 165, 250, 0.4);
        }
        
        .formatted-response h4 {
          color: #a7f3d0;
          margin: 16px 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #a7f3d0, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

// Main App Component
const StudentCareerHelper: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const appStyles: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, rgb(16, 23, 53) 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.8s ease-out'
  };

  const mainContentStyles: React.CSSProperties = {
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const heroSectionStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.35) 100%)',
    padding: '56px 10px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box'
  };

  const heroTitleStyles: React.CSSProperties = {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #c7b7ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
    width: '100%',
    padding: '0 10px',
    boxSizing: 'border-box',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out 0.2s'
  };

  const heroDescriptionStyles: React.CSSProperties = {
    fontSize: '20px',
    color: '#e5e7eb',
    width: '100%',
    margin: '0',
    lineHeight: '1.7',
    fontWeight: '300',
    padding: '0 10px',
    boxSizing: 'border-box',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out 0.4s'
  };

  const featuresStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '10px',
    marginTop: '30px',
    flexWrap: 'wrap',
    width: '100%',
    padding: '0 10px',
    boxSizing: 'border-box',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out 0.6s'
  };

  const featureStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#e6e6f0',
    background: 'rgba(255,255,255,0.08)',
    padding: '10px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.14)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const chatSectionStyles: React.CSSProperties = {
    flex: 1,
    padding: '30px 10px 20px 10px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out 0.8s'
  };

  const chatWrapperStyles: React.CSSProperties = {
    height: 'calc(100vh - 280px)',
    width: '100%',
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.35)'
  };

  return (
    <div style={appStyles}>
      <div style={mainContentStyles}>
        {/* Hero Section */}
        <div style={heroSectionStyles}>
          <h1 style={heroTitleStyles}>
            Welcome to Student Career Helper
          </h1>
          <p style={heroDescriptionStyles}>
            Your comprehensive AI-powered assistant for career guidance, college selection, 
            interview preparation, and educational planning. Get personalized advice to shape your future success.
          </p>
          <div style={featuresStyles}>
            <span style={featureStyles} className="feature-button">💼 Career Guidance</span>
            <span style={featureStyles} className="feature-button">🎓 College Selection</span>
            <span style={featureStyles} className="feature-button">📄 Resume Building</span>
            <span style={featureStyles} className="feature-button">🎯 Interview Prep</span>
            <span style={featureStyles} className="feature-button">📊 Skill Assessment</span>
          </div>
        </div>

        {/* Chat Interface */}
        <div style={chatSectionStyles}>
          <div style={chatWrapperStyles}>
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCareerHelper;