import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ currentProject, setCurrentProject, onThemeToggle, currentTheme }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const recentProjects = [
    { id: 1, name: 'Summer Melody', created: '2 hours ago', lastModified: 'Today' },
    { id: 2, name: 'Jazz Improvisation', created: '3 days ago', lastModified: 'Yesterday' },
    { id: 3, name: 'Ambient Soundtrack', created: '1 week ago', lastModified: '3 days ago' }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle">
        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">Navigation</h3>
          <Link 
            to="/generate" 
            className={`nav-link ${isActive('/generate') || isActive('/') ? 'active' : ''}`}
            title="Music Generation"
          >
            <span className="icon">✨</span>
            <span className="label">Generate</span>
          </Link>
          <Link 
            to="/editor" 
            className={`nav-link ${isActive('/editor') ? 'active' : ''}`}
            title="MIDI Editing"
          >
            <span className="icon">🎹</span>
            <span className="label">Editor</span>
          </Link>
          <Link 
            to="/lyrics" 
            className={`nav-link ${isActive('/lyrics') ? 'active' : ''}`}
            title="Lyrics Management"
          >
            <span className="icon">📝</span>
            <span className="label">Lyrics</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-content">
        <div className="projects-section">
          <h3 className="section-title">Recent Projects</h3>
          {recentProjects && recentProjects.length > 0 ? (
            <div className="projects-list">
              {recentProjects.map(project => (
                <div 
                  key={project.id}
                  className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => setCurrentProject(project)}
                >
                  <div className="project-icon">🎵</div>
                  <div className="project-details">
                    <span className="project-name">{project.name}</span>
                    <span className="project-meta">{project.lastModified}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>📭 No projects yet</p>
              <p className="hint">Start by generating music</p>
            </div>
          )}
        </div>

        <button className="btn btn-secondary" style={{ width: '100%' }}>
          + New Project
        </button>
      </div>

      <div className="sidebar-footer">
        <button 
          className="settings-btn"
          onClick={onThemeToggle}
          title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="icon">{currentTheme === 'light' ? '🌙' : '☀️'}</span>
          <span className="label">{currentTheme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
