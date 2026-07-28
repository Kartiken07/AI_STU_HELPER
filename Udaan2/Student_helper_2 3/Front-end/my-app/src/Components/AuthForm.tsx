import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '16px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    position: 'relative' as const,
    zIndex: 2,
  };

  const inputWrapperStyle = (): React.CSSProperties => ({
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(71, 85, 105, 0.4)',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f23 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `hsl(${240 + Math.random() * 60}, 70%, 60%)`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.7,
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute', top: '20%', left: '15%', width: '120px', height: '120px',
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
        borderRadius: '20px', transform: 'rotate(45deg)',
        animation: 'rotateFloat 12s linear infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '25%', right: '10%', width: '80px', height: '80px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), transparent)',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        animation: 'bounce 4s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes rotateFloat {
          0% { transform: rotate(45deg) translateY(0px); }
          50% { transform: rotate(225deg) translateY(-15px); }
          100% { transform: rotate(405deg) translateY(0px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          75% { transform: translateY(-5px) rotate(-5deg); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px) scale(0.9); }
          to { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .auth-card { animation: slideInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index: 10; }
        .input-wrapper { position: relative; overflow: hidden; }
        .input-wrapper::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
          transition: left 0.5s;
        }
        .input-wrapper:focus-within::before { left: 100%; }
        .btn-primary { position: relative; overflow: hidden; }
        .btn-primary::before {
          content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0;
          background: rgba(255, 255, 255, 0.1); border-radius: 50%;
          transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s;
        }
        .btn-primary:hover::before { width: 300px; height: 300px; }
        .error-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="auth-card" style={{
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.9), rgba(30, 30, 60, 0.8))',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: '-2px',
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
          borderRadius: '26px', zIndex: -1,
          animation: 'glow 3s ease-in-out infinite', opacity: 0.6,
        }} />

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '50%', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '50%', animation: 'ripple 2s infinite', zIndex: -1,
            }} />
            {isLogin ? '🚀' : '✨'}
          </div>
          <h1 style={{
            color: '#ffffff', fontSize: '32px', fontWeight: '800',
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #ffffff, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {isLogin ? 'Career Hub' : 'Join Career Hub'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0, fontWeight: '400' }}>
            {isLogin ? 'Unlock your professional potential' : 'Start your professional journey today'}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Email</label>
          <div className="input-wrapper" style={inputWrapperStyle()}
            onFocus={(e) => { const w = e.currentTarget; w.style.borderColor = '#6366f1'; w.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; w.style.transform = 'translateY(-2px)'; }}
            onBlur={(e) => { const w = e.currentTarget; w.style.borderColor = 'rgba(71, 85, 105, 0.4)'; w.style.boxShadow = 'none'; w.style.transform = 'translateY(0)'; }}
          >
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress} placeholder="your@email.com" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: isLogin ? '30px' : '24px' }}>
          <label style={labelStyle}>{isLogin ? 'Password' : 'Create Password'}</label>
          <div className="input-wrapper" style={inputWrapperStyle()}
            onFocus={(e) => { const w = e.currentTarget; w.style.borderColor = '#6366f1'; w.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; w.style.transform = 'translateY(-2px)'; }}
            onBlur={(e) => { const w = e.currentTarget; w.style.borderColor = 'rgba(71, 85, 105, 0.4)'; w.style.boxShadow = 'none'; w.style.transform = 'translateY(0)'; }}
          >
            <input type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress}
              placeholder={isLogin ? 'Enter your password' : 'Create a secure password'}
              style={{ ...inputStyle, padding: '16px 55px 16px 20px' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                fontSize: '20px', padding: '8px', borderRadius: '8px', transition: 'all 0.2s ease', zIndex: 3,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'none'; }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <div className="input-wrapper" style={inputWrapperStyle()}
              onFocus={(e) => { const w = e.currentTarget; w.style.borderColor = '#6366f1'; w.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; w.style.transform = 'translateY(-2px)'; }}
              onBlur={(e) => { const w = e.currentTarget; w.style.borderColor = 'rgba(71, 85, 105, 0.4)'; w.style.boxShadow = 'none'; w.style.transform = 'translateY(0)'; }}
            >
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Confirm your password"
                style={{ ...inputStyle, padding: '16px 55px 16px 20px' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="error-shake" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 127, 0.05))',
            border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5',
            padding: '16px 20px', borderRadius: '12px', fontSize: '14px',
            marginBottom: '24px', fontWeight: '500',
          }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={isLoading}
          className="btn-primary"
          style={{
            width: '100%', padding: '18px',
            background: isLoading ? 'linear-gradient(135deg, #4c1d95, #5b21b6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '16px', color: '#ffffff', fontSize: '18px',
            fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
            opacity: isLoading ? 0.7 : 1, position: 'relative', zIndex: 1,
          }}
          onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.4)'; } }}
          onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)'; } }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                width: '20px', height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #ffffff', borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              {isLogin ? 'Signing In...' : 'Creating Account...'}
            </div>
          ) : (
            isLogin ? 'Launch Career' : 'Create Account'
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(71, 85, 105, 0.2)' }}>
          {isLogin ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{
                color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.textShadow = '0 0 8px rgba(99, 102, 241, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.textShadow = 'none'; }}
              >
                Create Account
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Already have an account?</span>
              <Link to="/login" style={{
                color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.textShadow = '0 0 8px rgba(99, 102, 241, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.textShadow = 'none'; }}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
