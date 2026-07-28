import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
const HomePage: React.FC = () => {
  const navigate=useNavigate()
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show chat widget after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatWidget(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Updated styles with better centering
  const pageStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    color: 'white',
    width: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    position: 'relative'
  };

  const heroSectionStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.35) 100%), url('/udaan-hero.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '0 20px'
  };

  const heroContentStyle: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '900px',
    width: '100%',
    padding: '2rem',
    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 1s ease-out',
    zIndex: 2,
    margin: '0 auto'
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: '800',
    marginBottom: '1.5rem',
    background: 'linear-gradient(45deg,rgba(255, 230, 38, 0.95),rgb(224, 115, 14))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 20px rgba(200, 175, 13, 0.59)'
  };

  const heroSubtitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
    marginBottom: '2.5rem',
    color: '#f0f8ff',
    lineHeight: '1.6',
    fontWeight: '300',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };

  const ctaButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg,rgb(150, 80, 0), #feca57)',
    border: 'none',
    padding: '1rem 3rem',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
    margin: '0 1rem 1rem 0',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: '2px solid rgba(255,255,255,0.5)',
    padding: '1rem 3rem',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 1rem 1rem 0',
    backdropFilter: 'blur(10px)'
  };

  // Centered section wrapper
  const sectionWrapperStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5rem 20px',
    background: 'linear-gradient(135deg,rgb(16, 23, 53) 0%, #764ba2 100%)'
  };

  const sectionStyle: React.CSSProperties = {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    textAlign: 'center'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '3rem',
    background: 'linear-gradient(45deg,rgb(202, 204, 212) 0%,rgb(175, 170, 181) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const featuresGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
    width: '100%',
    justifyItems: 'center'
  };

  const featureCardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg,rgb(181, 112, 23),rgb(234, 85, 39))',
    padding: '2.5rem',
    borderRadius: '20px',
    border: '1px solid #333',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '350px'
  };

  const featureIconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
    display: 'block'
  };

  const featureTitle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white'
  };

  const featureDescription: React.CSSProperties = {
    color: '#ccc',
    lineHeight: '1.6',
    fontSize: '1rem'
  };

  const statsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginTop: '4rem',
    textAlign: 'center',
    width: '100%',
    justifyItems: 'center'
  };

  const statItemStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'linear-gradient(145deg,rgb(12, 14, 20), #764ba2)',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(114, 137, 236, 0.3)',
    width: '100%',
    maxWidth: '250px'
  };

  const statNumberStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '800',
    color: 'white',
    marginBottom: '0.5rem'
  };

  const statLabelStyle: React.CSSProperties = {
    color: '#f0f8ff',
    fontSize: '1.1rem',
    fontWeight: '500'
  };

  const aboutSectionStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg,rgb(16, 23, 53) 0%, #764ba2 100%)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5rem 20px'
  };

  const aboutContentStyle: React.CSSProperties = {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    fontSize: '1.2rem',
    lineHeight: '1.8',
    color: '#ddd',
    textAlign: 'center'
  };

  const teamSectionStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg,rgb(16, 23, 53) 0%, #764ba2 100%)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '5rem 20px'
  };

  const teamGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    width: '100%',
    margin: '3rem auto',
    justifyItems: 'center'
  };

  const teamMemberStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '2rem',
    background: 'linear-gradient(145deg,rgb(138, 75, 17),rgb(224, 144, 15))',
    borderRadius: '20px',
    border: '1px solid #333',
    transition: 'transform 0.3s ease',
    width: '100%',
    maxWidth: '300px'
  };

  const avatarStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg,rgb(20, 28, 64), #764ba2)',
    margin: '0 auto 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem'
  };

  const footerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg,rgb(16, 23, 53) 0%, #764ba2 100%)',
    padding: '3rem 20px',
    textAlign: 'center',
    color: 'white',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const footerContentStyle: React.CSSProperties = {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto'
  };

  const floatingElementStyle: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    animation: 'float 6s ease-in-out infinite'
  };

  // Chat Widget Styles
  const chatWidgetContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: 1000,
    opacity: showChatWidget ? 1 : 0,
    transform: showChatWidget ? 'translateX(0)' : 'translateX(100px)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: showChatWidget ? 'auto' : 'none'
  };

  const chatWidgetStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
    borderRadius: '25px',
    padding: '20px',
    boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4), 0 8px 25px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    maxWidth: '280px',
    position: 'relative',
    overflow: 'hidden'
  };

  const chatWidgetHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  };

  const chatWidgetAvatarStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    animation: 'pulse 2s infinite',
    border: '2px solid rgba(255,255,255,0.3)'
  };

  const chatWidgetTextStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
    margin: 0
  };

  const chatWidgetMessageStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.3'
  };

  const chatWidgetButtonStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    padding: '8px 16px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '12px',
    width: '100%',
    textAlign: 'center'
  };

  const handleChatWidgetClick = () => {
    navigate('/chat');
  };

  const features = [
    { icon: '🎯', title: 'Career Assessment', desc: 'Comprehensive quiz to identify your strengths and interests' },
    { icon: '🤖', title: 'AI-Powered Guidance', desc: 'Get personalized career recommendations using advanced AI' },
    { icon: '🏫', title: 'College Matching', desc: 'Find the perfect colleges that match your career goals' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your progress with detailed charts and insights' }
  ];

  return (
    <div style={pageStyle}>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        {/* Floating background elements */}
        <div style={{...floatingElementStyle, top: '10%', left: '10%', width: '80px', height: '80px', animationDelay: '0s'}}></div>
        <div style={{...floatingElementStyle, top: '70%', right: '15%', width: '120px', height: '120px', animationDelay: '2s'}}></div>
        <div style={{...floatingElementStyle, bottom: '20%', left: '20%', width: '60px', height: '60px', animationDelay: '4s'}}></div>
        
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            🕊️ Udaan — Student Career Helper
          </h1>
          <p style={heroSubtitleStyle}>
            Take flight with personalized guidance for careers, scholarships, skills and colleges —
            built for India’s students and aligned with NEP 2020.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button style={ctaButtonStyle} onClick={() => navigate("/quiz")}>
              Take Career Quiz
            </button>
            <button style={secondaryButtonStyle} onClick={() => navigate("/chat")}>
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div style={sectionWrapperStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Why Choose Udaan?</h2>
          
          <div style={featuresGridStyle}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  ...featureCardStyle,
                  transform: currentFeature === index ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: currentFeature === index ? '0 20px 40px rgba(102, 126, 234, 0.3)' : '0 5px 15px rgba(0,0,0,0.3)'
                }}
              >
                <span style={featureIconStyle}>{feature.icon}</span>
                <h3 style={featureTitle}>{feature.title}</h3>
                <p style={featureDescription}>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div style={statsContainerStyle}>
            <div style={statItemStyle}>
              <div style={statNumberStyle}>10K+</div>
              <div style={statLabelStyle}>Students Helped</div>
            </div>
            <div style={statItemStyle}>
              <div style={statNumberStyle}>95%</div>
              <div style={statLabelStyle}>Accuracy Rate</div>
            </div>
            <div style={statItemStyle}>
              <div style={statNumberStyle}>500+</div>
              <div style={statLabelStyle}>Career Paths</div>
            </div>
            <div style={statItemStyle}>
              <div style={statNumberStyle}>24/7</div>
              <div style={statLabelStyle}>AI Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section style={aboutSectionStyle}>
        <div style={aboutContentStyle}>
          <h2 style={sectionTitleStyle}>About Udaan</h2>
          <p>
            At Udaan, we believe every student deserves personalized guidance to unlock their potential. 
            Our cutting-edge AI technology combines comprehensive career assessments with real-time market insights 
            to provide you with the most accurate and relevant career recommendations.
          </p>
          <p style={{ marginTop: '2rem' }}>
            Whether you're a high school student exploring options or a college student planning your future, 
            our platform offers the tools and insights you need to make informed decisions about your career journey — from courses and certifications to scholarships and internships.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <div style={sectionWrapperStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>How Udaan Works</h2>
          <div style={featuresGridStyle}>
            <div style={featureCardStyle}>
              <span style={featureIconStyle}>1️⃣</span>
              <h3 style={featureTitle}>Take the Assessment</h3>
              <p style={featureDescription}>
                Complete our comprehensive quiz covering aptitude, interests, and subject knowledge.
              </p>
            </div>
            <div style={featureCardStyle}>
              <span style={featureIconStyle}>2️⃣</span>
              <h3 style={featureTitle}>Get AI Analysis</h3>
              <p style={featureDescription}>
                Our advanced AI analyzes your responses and matches you with suitable career paths.
              </p>
            </div>
            <div style={featureCardStyle}>
              <span style={featureIconStyle}>3️⃣</span>
              <h3 style={featureTitle}>Explore Recommendations</h3>
              <p style={featureDescription}>
                Discover detailed career information, required skills, and educational pathways.
              </p>
            </div>
            <div style={featureCardStyle}>
              <span style={featureIconStyle}>4️⃣</span>
              <h3 style={featureTitle}>Plan Your Journey</h3>
              <p style={featureDescription}>
                Find colleges, courses, and create a roadmap to achieve your career goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <section style={teamSectionStyle}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <h2 style={sectionTitleStyle}>Meet The Udaan Team</h2>
          <div style={teamGridStyle}>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👨‍💻</div>
              <h3 style={featureTitle}>Development Team</h3>
              <p style={featureDescription}>
                Experienced developers creating innovative solutions for career guidance.
              </p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>🧠</div>
              <h3 style={featureTitle}>AI Specialists</h3>
              <p style={featureDescription}>
                Machine learning experts building intelligent recommendation systems.
              </p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>👩‍🎓</div>
              <h3 style={featureTitle}>Career Counselors</h3>
              <p style={featureDescription}>
                Professional counselors ensuring accurate and helpful career guidance.
              </p>
            </div>
            <div style={teamMemberStyle}>
              <div style={avatarStyle}>📊</div>
              <h3 style={featureTitle}>Data Analysts</h3>
              <p style={featureDescription}>
                Researchers analyzing career trends and market demands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Ready to Take Flight?</h2>
          <p style={{ marginBottom: '2rem', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
            Join thousands of students who have found their perfect career path with Udaan
          </p>
          <button style={ctaButtonStyle}  onClick={() => navigate("/chat")}>
            Get Started Today
          </button>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p>&copy; 2026 Udaan. Empowering students to shape their future.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      {showChatWidget && (
        <div style={chatWidgetContainerStyle}>
          <div 
            style={chatWidgetStyle}
            onClick={handleChatWidgetClick}
            className="chat-widget"
          >
            <div style={chatWidgetHeaderStyle}>
              <div style={chatWidgetAvatarStyle}>🤖</div>
              <div>
                <p style={chatWidgetTextStyle}>Career Assistant</p>
                <p style={chatWidgetMessageStyle}>Want to know how to start? Click me!</p>
              </div>
            </div>
            <button style={chatWidgetButtonStyle}>
              Start Chatting →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
        }
        
        .chat-widget:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 25px 50px rgba(79, 70, 229, 0.5), 0 12px 30px rgba(0,0,0,0.3);
        }
        
        .chat-widget:hover button {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
        
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;