import React, { useState } from 'react';
import './AudioUpload.css';

function AudioUpload({ onUpload, loading, analysisResults }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const supportedTypes = ['audio/wav', 'audio/mpeg', 'audio/ogg'];
    
    if (!supportedTypes.includes(file.type)) {
      setError('Unsupported file type. Please use WAV, MP3, or OGG.');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 100MB.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        onUpload(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        onUpload(file);
      }
    }
  };

  return (
    <div className="audio-upload">
      {!fileName ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            {loading ? (
              <>
                <div className="upload-spinner">
                  <div className="spinner"></div>
                </div>
                <h3>Analyzing Audio...</h3>
                <p>Please wait while we process your file</p>
              </>
            ) : (
              <>
                <div className="upload-icon">🎵</div>
                <h3>Upload Audio File</h3>
                <p>Drag and drop your audio file here or click to select</p>
                <p className="supported">Supported: WAV, MP3, OGG (max 100MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="audio/*"
            onChange={handleChange}
            disabled={loading}
            className="file-input"
          />
        </div>
      ) : (
        <div className="upload-success">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h4>{fileName}</h4>
              <p>{fileSize}</p>
            </div>
            {!loading && (
              <button
                className="btn-change"
                onClick={() => {
                  setFileName(null);
                  setFileSize(null);
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          {analysisResults && (
            <div className="analysis-display">
              <h4>Audio Analysis</h4>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="label">Tempo:</span>
                  <span className="value">{analysisResults.tempo?.toFixed(1)} BPM</span>
                </div>
                <div className="analysis-item">
                  <span className="label">Duration:</span>
                  <span className="value">{analysisResults.duration?.toFixed(2)}s</span>
                </div>
                {analysisResults.key && (
                  <div className="analysis-item">
                    <span className="label">Key:</span>
                    <span className="value">{analysisResults.key}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default AudioUpload;
