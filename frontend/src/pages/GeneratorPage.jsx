import React, { useState } from 'react';
import { analyzeAudio, generateMusic } from '../services/api';
import AudioUpload from '../components/AudioUpload';
import GenerationControls from '../components/GenerationControls';
import './GeneratorPage.css';

function GeneratorPage() {
  const [audioFile, setAudioFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [generatedMidi, setGeneratedMidi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationHistory, setGenerationHistory] = useState([]);

  const handleAudioUpload = async (file) => {
    setAudioFile(file);
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setGenerationStep(1);

    try {
      const results = await analyzeAudio(file);
      setAnalysisResults(results);
      setSuccessMsg('✓ Audio analyzed successfully');
      setGenerationStep(2);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
      setGenerationStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (params) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setGenerationStep(3);

    try {
      const midi = await generateMusic({ ...params, audio_seed: audioFile });
      setGeneratedMidi(midi);
      setGenerationHistory([...generationHistory, { timestamp: new Date(), params, midi }]);
      setSuccessMsg('✓ Music generated successfully');
      setGenerationStep(4);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
      setGenerationStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMIDI = () => {
    if (!generatedMidi) return;
    
    try {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(generatedMidi, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `generated_music_${Date.now()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setSuccessMsg('✓ MIDI downloaded');
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError('Download failed: ' + err.message);
    }
  };

  const handleClearAll = () => {
    setAudioFile(null);
    setAnalysisResults(null);
    setGeneratedMidi(null);
    setGenerationHistory([]);
    setGenerationStep(0);
    setError(null);
  };

  return (
    <main className="generator-page">
      <div className="generator-container">
        <h1>🎵 AI Music Generator</h1>
        <p className="subtitle">Upload audio and generate original music using AI</p>

        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`step ${generationStep >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Upload Audio</div>
          </div>
          <div className={`step-connector ${generationStep >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${generationStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Analyze</div>
          </div>
          <div className={`step-connector ${generationStep >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${generationStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">Generate</div>
          </div>
          <div className={`step-connector ${generationStep >= 4 ? 'active' : ''}`}></div>
          <div className={`step ${generationStep >= 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">Export</div>
          </div>
        </div>

        {/* Audio Upload Section */}
        <section className="upload-section">
          <h2>📂 Step 1: Choose Audio</h2>
          <AudioUpload 
            onUpload={handleAudioUpload} 
            loading={loading}
            analysisResults={analysisResults}
          />
        </section>

        {/* Analysis Results Section */}
        {analysisResults && (
          <section className="analysis-section">
            <h2>📊 Step 2: Audio Analysis</h2>
            <div className="analysis-results">
              <div className="analysis-grid">
                <div className="analysis-card">
                  <div className="card-icon">🎵</div>
                  <div className="card-label">Tempo</div>
                  <div className="card-value">{analysisResults.tempo?.toFixed(1) || 'N/A'} BPM</div>
                </div>
                <div className="analysis-card">
                  <div className="card-icon">⏱️</div>
                  <div className="card-label">Duration</div>
                  <div className="card-value">{analysisResults.duration?.toFixed(2) || 'N/A'}s</div>
                </div>
                <div className="analysis-card">
                  <div className="card-icon">🎹</div>
                  <div className="card-label">Key Detected</div>
                  <div className="card-value">{analysisResults.key || 'N/A'}</div>
                </div>
                {analysisResults.chords && (
                  <div className="analysis-card">
                    <div className="card-icon">🎼</div>
                    <div className="card-label">Chords Found</div>
                    <div className="card-value">{analysisResults.chords.length}</div>
                  </div>
                )}
              </div>

              {analysisResults.chords && (
                <div className="chords-display">
                  <h3>Detected Chord Progression</h3>
                  <div className="chord-sequence">
                    {analysisResults.chords.slice(0, 8).map((chord, idx) => (
                      <span key={idx} className="chord-tag">{chord}</span>
                    ))}
                    {analysisResults.chords.length > 8 && (
                      <span className="chord-tag more">+{analysisResults.chords.length - 8} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Generation Controls Section */}
        {analysisResults && (
          <section className="generation-section">
            <h2>✨ Step 3: Configure Generation</h2>
            <GenerationControls
              analysisResults={analysisResults}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </section>
        )}

        {/* Generated Results Section */}
        {generatedMidi && (
          <section className="results-section">
            <h2>🎉 Step 4: Export Your Music</h2>
            <div className="generation-results">
              <div className="result-info">
                <h3>Generation Complete!</h3>
                <div className="result-stats">
                  <div className="stat">
                    <span className="label">Notes Generated:</span>
                    <span className="value">{generatedMidi.notes?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Total Duration:</span>
                    <span className="value">{(generatedMidi.total_time || 0).toFixed(2)}s</span>
                  </div>
                  <div className="stat">
                    <span className="label">Generated At:</span>
                    <span className="value">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="export-actions">
                <button className="btn btn-primary" onClick={handleDownloadMIDI}>
                  💾 Download MIDI
                </button>
                <button className="btn btn-secondary" onClick={() => window.location.href = '/editor'}>
                  ✏️ Edit in MIDI Editor
                </button>
                <button className="btn btn-secondary" onClick={handleClearAll}>
                  🔄 Start Over
                </button>
              </div>
            </div>

            {generationHistory.length > 1 && (
              <div className="history-panel">
                <h3>Generation History</h3>
                <div className="history-list">
                  {generationHistory.slice(-5).reverse().map((entry, idx) => (
                    <div key={idx} className="history-item">
                      <span className="history-time">{entry.timestamp.toLocaleTimeString()}</span>
                      <span className="history-model">{entry.params.model_name || 'Unknown'}</span>
                      <span className="history-notes">{entry.midi.notes?.length || 0} notes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Messages */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button className="close-btn" onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {successMsg && (
          <div className="success-banner">
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </main>
  );
}

export default GeneratorPage;
