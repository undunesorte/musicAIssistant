import React, { useState } from 'react';
import './GenerationControls.css';

function GenerationControls({ analysisResults, onGenerate, loading }) {
  const [numSteps, setNumSteps] = useState(128);
  const [temperature, setTemperature] = useState(1.0);
  const [modelType, setModelType] = useState('melody');
  const [seedNotes, setSeedNotes] = useState(null);
  const [useAudioAsSeed, setUseAudioAsSeed] = useState(false);
  const [error, setError] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);

  const handleGenerate = async () => {
    try {
      setError(null);
      const params = {
        num_steps: numSteps,
        temperature: parseFloat(temperature),
        model_name: modelType
      };

      if (useAudioAsSeed && seedNotes) {
        params.seed_notes = seedNotes;
      }

      const response = await onGenerate(params);
      setGenerationResult(response);
    } catch (err) {
      setError(err.message || 'Generation failed');
    }
  };

  const temperatureColor = () => {
    if (temperature < 0.7) return '#4CAF50';
    if (temperature < 1.0) return '#FFC107';
    if (temperature < 1.5) return '#FF9800';
    return '#F44336';
  };

  const getTemperatureDesc = () => {
    if (temperature < 0.7) return 'Conservative - Follows patterns closely';
    if (temperature < 1.0) return 'Balanced - Good diversity';
    if (temperature < 1.5) return 'Creative - More experimental';
    return 'Very Creative - Highly experimental';
  };

  return (
    <div className="generation-controls">
      <h3>🎼 Generation Parameters</h3>
      
      <div className="params-grid">
        <div className="param-group">
          <label htmlFor="model-type">Generation Model</label>
          <div className="select-wrapper">
            <select
              id="model-type"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              disabled={loading}
            >
              <option value="melody">🎵 Melody RNN - Single melody line</option>
              <option value="performance">🎹 Performance RNN - Expression & timing</option>
              <option value="drums">🥁 Drums RNN - Drum patterns</option>
            </select>
          </div>
        </div>

        <div className="param-group">
          <label htmlFor="num-steps">
            Number of Steps: <span className="value">{numSteps}</span>
          </label>
          <input
            id="num-steps"
            type="range"
            min="32"
            max="512"
            step="32"
            value={numSteps}
            onChange={(e) => setNumSteps(parseInt(e.target.value))}
            disabled={loading}
            className="slider"
          />
          <div className="range-labels">
            <span>32 steps (~6s)</span>
            <span>512 steps (~90s)</span>
          </div>
        </div>

        <div className="param-group">
          <label htmlFor="temperature">
            Temperature: <span 
              className="value" 
              style={{ color: temperatureColor() }}
            >
              {temperature.toFixed(2)}
            </span>
          </label>
          <input
            id="temperature"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            disabled={loading}
            className="slider"
          />
          <p className="temperature-desc">{getTemperatureDesc()}</p>
          <div className="range-labels">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>
      </div>

      {analysisResults && (
        <div className="seed-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useAudioAsSeed}
              onChange={(e) => setUseAudioAsSeed(e.target.checked)}
              disabled={loading}
            />
            <span>Use detected notes as seed</span>
          </label>
          {useAudioAsSeed && analysisResults.detected_notes && (
            <div className="detected-notes">
              <p className="notes-label">Detected notes:</p>
              <div className="notes-display">
                {analysisResults.detected_notes.slice(0, 8).map((note, i) => (
                  <span key={i} className="note-tag">{note}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Generating...
            </>
          ) : (
            <>✨ Generate Music</>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {generationResult && (
        <div className="generation-result">
          <h4>✓ Generation Complete</h4>
          <div className="result-info">
            <div className="result-item">
              <span className="label">Notes Generated:</span>
              <span className="value">{generationResult.num_notes || 0}</span>
            </div>
            <div className="result-item">
              <span className="label">Duration:</span>
              <span className="value">{(generationResult.total_time || 0).toFixed(2)}s</span>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn btn-secondary">Download MIDI</button>
            <button className="btn btn-secondary">Edit in MIDI Editor</button>
            <button className="btn btn-secondary">Add Drums</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerationControls;
