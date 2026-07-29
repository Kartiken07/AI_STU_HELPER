import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onLogout?: () => void; // 👈 accept logout handler from App
  isLoggedIn?: boolean;  // 👈 know if user is logged in
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, isLoggedIn }) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [, setActiveLink] = useState<string>('Home');
  const navigate = useNavigate();

  const navbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(90deg,rgb(16, 23, 53) 0%, #764ba2 100%)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    zIndex: 1000,
    padding: '0',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    transition: 'transform 0.2s ease'
  };

  const logoHoverStyle: React.CSSProperties = {
    transform: hoveredLink === 'logo' ? 'scale(1.05)' : 'scale(1)'
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const linkStyle: React.CSSProperties = {
    color: '#d6d9e0',
    textDecoration: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
    border: '1px solid transparent',
    background: 'transparent'
  };

  const getNavLinkStyle = (isActive: boolean, linkName: string): React.CSSProperties => {
    const isHovered = hoveredLink === linkName;
    return {
      ...linkStyle,
      color: isActive ? '#ffffff' : (isHovered ? '#ffffff' : '#d6d9e0'),
      background: isActive
        ? 'rgba(139, 92, 246, 0.18)'
        : (isHovered ? 'rgba(255, 255, 255, 0.06)' : 'transparent'),
      borderColor: isActive ? 'rgba(139,92,246,0.35)' : (isHovered ? 'rgba(255,255,255,0.12)' : 'transparent'),
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isActive
        ? '0 4px 14px rgba(139, 92, 246, 0.25)'
        : (isHovered ? '0 2px 10px rgba(0, 0, 0, 0.25)' : 'none')
    };
  };

  const authButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  };

  const buttonBase: React.CSSProperties = {
    ...linkStyle,
    fontWeight: '600'
  };

  const loginButtonStyle: React.CSSProperties = {
    ...buttonBase,
    background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)'
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonBase,
    border: '2px solid #e63946',
    color: '#ff6b6b',
    background: 'transparent'
  };

  const navigationLinks: { name: string; path: string }[] = [
    { name: "Home", path: "/home" },
    { name: "Chat", path: "/chat" },
    { name: "PDF Analyser", path: "/pdf" },
    { name: "Quiz", path: "/quiz" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <a
          href="/"
          style={{ ...logoStyle, ...logoHoverStyle }}
          onMouseEnter={() => setHoveredLink('logo')}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <img
            src="/udaan-logo.png"
            alt="Udaan"
            style={{ height: '150px',position:'relative',left:'-160px', width: 'auto', display: 'block' }}
          />
        </a>

        {/* Navigation Links */}
        <ul style={navLinksStyle}>
          {navigationLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                style={({ isActive }) => getNavLinkStyle(isActive, link.name)}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => setActiveLink(link.name)}
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          {/* Auth Buttons */}
          <div style={authButtonsStyle}>
            {!isLoggedIn ? (
              <>
                <NavLink to="/login" style={{ textDecoration: 'none' }}>
                  <button
                    style={loginButtonStyle}
                    onMouseEnter={() => setHoveredLink('Login')}
                    onMouseLeave={() => setHoveredLink(null)}
                    onClick={() => setActiveLink('Login')}
                  >
                    Login
                  </button>
                </NavLink>
              </>
            ) : (
              <button
                style={logoutButtonStyle}
                onMouseEnter={() => setHoveredLink('Logout')}
                onMouseLeave={() => setHoveredLink(null)}
                onClick={() => { onLogout?.(); navigate('/login'); }}
              >
                Logout
              </button>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
