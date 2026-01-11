import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeneratorPage from './pages/GeneratorPage';
import EditorPage from './pages/EditorPage';
import LyricsPage from './pages/LyricsPage';
import './App.css';

function App() {
  const [currentProject, setCurrentProject] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('musicAI-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('musicAI-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar 
            currentProject={currentProject} 
            setCurrentProject={setCurrentProject}
            onThemeToggle={toggleTheme}
            currentTheme={theme}
          />
          <Routes>
            <Route path="/" element={<GeneratorPage />} />
            <Route path="/generate" element={<GeneratorPage />} />
            <Route path="/editor" element={<EditorPage currentProject={currentProject} />} />
            <Route path="/lyrics" element={<LyricsPage currentProject={currentProject} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
