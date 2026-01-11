import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <h1 className="logo">🎵 musicAIssistant</h1>
          <p className="tagline">AI-Powered Music Generation & Editing</p>
        </div>

        <nav className={`header-nav ${showMenu ? 'mobile-open' : ''}`}>
          <a 
            href="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            Home
          </a>
          <a 
            href="/generate" 
            className={`nav-link ${isActive('/generate') ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            Generate
          </a>
          <a 
            href="/editor" 
            className={`nav-link ${isActive('/editor') ? 'active' : ''}`}
          >
            <span className="nav-icon">🎹</span>
            Editor
          </a>
          <a 
            href="/lyrics" 
            className={`nav-link ${isActive('/lyrics') ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            Lyrics
          </a>
        </nav>

        <div className="header-actions">
          <button className="icon-btn" title="Help">
            <span className="icon">❓</span>
          </button>
          <button className="icon-btn" title="Settings">
            <span className="icon">⚙️</span>
          </button>
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            title="Menu"
          >
            <span className="menu-icon">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
