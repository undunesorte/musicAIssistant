import React, { useState, useEffect } from 'react';
import './EditorPage.css';

function EditorPage({ currentProject }) {
  const [midiNotes, setMidiNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [instrument, setInstrument] = useState('piano');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Transformation states
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [quantizeGrid, setQuantizeGrid] = useState('quarter');
  const [showTransformPanel, setShowTransformPanel] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    calculateStatistics();
  }, [midiNotes]);

  const calculateStatistics = () => {
    if (midiNotes.length === 0) {
      setStatistics(null);
      return;
    }

    const pitches = midiNotes.map(n => n.pitch);
    const velocities = midiNotes.map(n => n.velocity);
    const totalDuration = midiNotes.reduce((max, n) => 
      Math.max(max, n.startTime + n.duration), 0);

    setStatistics({
      noteCount: midiNotes.length,
      minPitch: Math.min(...pitches),
      maxPitch: Math.max(...pitches),
      avgVelocity: Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length),
      totalDuration: totalDuration.toFixed(2)
    });
  };

  const handleAddNote = () => {
    const newNote = {
      id: Math.random(),
      pitch: 60,
      velocity: 100,
      startTime: midiNotes.length > 0 ? Math.max(...midiNotes.map(n => n.startTime + n.duration)) : 0,
      duration: 0.5
    };
    setMidiNotes([...midiNotes, newNote]);
    setError(null);
  };

  const handleDeleteNote = (id) => {
    setMidiNotes(midiNotes.filter(note => note.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleDeleteSelectedNotes = () => {
    if (selectedNotes.length === 0) {
      setError('Select notes to delete');
      return;
    }
    const selectedIds = new Set(selectedNotes.map(n => n.id));
    setMidiNotes(midiNotes.filter(note => !selectedIds.has(note.id)));
    setSelectedNotes([]);
  };

  const handleUpdateNote = (id, updates) => {
    setMidiNotes(midiNotes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    ));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const handleToggleNoteSelection = (note, e) => {
    e.stopPropagation();
    if (selectedNotes.some(n => n.id === note.id)) {
      setSelectedNotes(selectedNotes.filter(n => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handleTranspose = async () => {
    if (transposeAmount === 0) {
      setError('Enter a transpose amount');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const transposed = midiNotes.map(note => ({
        ...note,
        pitch: Math.max(0, Math.min(127, note.pitch + transposeAmount))
      }));
      setMidiNotes(transposed);
      setSuccessMsg(`Transposed by ${transposeAmount > 0 ? '+' : ''}${transposeAmount} semitones`);
      setTransposeAmount(0);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Transpose failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const gridDurations = {
        'whole': 4.0,
        'half': 2.0,
        'quarter': 1.0,
        'eighth': 0.5,
        'sixteenth': 0.25,
        'triplet': 0.333
      };

      const gridSize = gridDurations[quantizeGrid];
      const quantized = midiNotes.map(note => ({
        ...note,
        startTime: Math.round(note.startTime / gridSize) * gridSize
      }));

      setMidiNotes(quantized);
      setSuccessMsg(`Quantized to ${quantizeGrid} notes`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Quantize failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMIDI = async () => {
    if (midiNotes.length === 0) {
      setError('Add notes before saving');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save_midi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: midiNotes,
          tempo,
          time_signature: timeSignature,
          instrument
        })
      });

      if (!response.ok) throw new Error('Save failed');
      
      setSuccessMsg('MIDI file saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMIDI = async () => {
    // This would open a file picker
    setError('MIDI file loading not yet implemented');
  };

  return (
    <main className="editor-page">
      <div className="editor-container">
        <h2>🎹 MIDI Editor</h2>

        <div className="editor-layout">
          {/* Left Panel - Controls */}
          <div className="controls-panel">
            <div className="control-section">
              <h3>Playback Settings</h3>
              
              <div className="control-group">
                <label htmlFor="tempo">Tempo (BPM)</label>
                <div className="control-input">
                  <input
                    id="tempo"
                    type="range"
                    min="20"
                    max="300"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value))}
                  />
                  <span className="value">{tempo}</span>
                </div>
              </div>

              <div className="control-group">
                <label htmlFor="time-sig">Time Signature</label>
                <select
                  id="time-sig"
                  value={timeSignature}
                  onChange={(e) => setTimeSignature(e.target.value)}
                >
                  <option value="4/4">4/4 (Common Time)</option>
                  <option value="3/4">3/4 (Waltz)</option>
                  <option value="6/8">6/8 (Compound)</option>
                  <option value="2/4">2/4 (Cut Time)</option>
                  <option value="5/4">5/4 (Progressive)</option>
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="instrument">Instrument</label>
                <select
                  id="instrument"
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                >
                  <option value="piano">Piano</option>
                  <option value="guitar">Guitar</option>
                  <option value="violin">Violin</option>
                  <option value="flute">Flute</option>
                  <option value="trumpet">Trumpet</option>
                  <option value="synth">Synthesizer</option>
                </select>
              </div>
            </div>

            <div className="control-section">
              <h3>Transformations</h3>
              
              <div className="control-group">
                <label htmlFor="transpose">Transpose (semitones)</label>
                <div className="control-input">
                  <input
                    id="transpose"
                    type="range"
                    min="-12"
                    max="12"
                    value={transposeAmount}
                    onChange={(e) => setTransposeAmount(parseInt(e.target.value))}
                  />
                  <span className="value">{transposeAmount > 0 ? '+' : ''}{transposeAmount}</span>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={handleTranspose}
                  disabled={loading || transposeAmount === 0}
                >
                  Apply Transpose
                </button>
              </div>

              <div className="control-group">
                <label htmlFor="quantize">Quantize Grid</label>
                <select
                  id="quantize"
                  value={quantizeGrid}
                  onChange={(e) => setQuantizeGrid(e.target.value)}
                >
                  <option value="whole">Whole Note</option>
                  <option value="half">Half Note</option>
                  <option value="quarter">Quarter Note</option>
                  <option value="eighth">Eighth Note</option>
                  <option value="sixteenth">Sixteenth Note</option>
                  <option value="triplet">Triplet</option>
                </select>
                <button
                  className="btn btn-sm"
                  onClick={handleQuantize}
                  disabled={loading}
                >
                  Apply Quantize
                </button>
              </div>
            </div>

            {statistics && (
              <div className="statistics-panel">
                <h3>Statistics</h3>
                <div className="stat-item">
                  <span className="label">Notes:</span>
                  <span className="value">{statistics.noteCount}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Pitch Range:</span>
                  <span className="value">{statistics.minPitch} - {statistics.maxPitch}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Avg Velocity:</span>
                  <span className="value">{statistics.avgVelocity}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Duration:</span>
                  <span className="value">{statistics.totalDuration}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Notes List and Editor */}
          <div className="editor-panel">
            <div className="notes-section">
              <div className="section-header">
                <h3>Notes ({midiNotes.length})</h3>
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={handleAddNote} disabled={loading}>
                    ➕ Add Note
                  </button>
                  {selectedNotes.length > 0 && (
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeleteSelectedNotes}
                      disabled={loading}
                    >
                      🗑️ Delete {selectedNotes.length}
                    </button>
                  )}
                </div>
              </div>

              {error && <div className="error-banner">{error}</div>}
              {successMsg && <div className="success-banner">{successMsg}</div>}

              {midiNotes.length === 0 ? (
                <div className="empty-state">
                  <p>📝 No notes yet</p>
                  <p className="subtitle">Click "Add Note" or load a MIDI file to begin</p>
                </div>
              ) : (
                <div className="notes-grid">
                  {midiNotes.map((note, idx) => (
                    <div
                      key={note.id}
                      className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''} ${selectedNotes.some(n => n.id === note.id) ? 'multi-selected' : ''}`}
                      onClick={() => {
                        setSelectedNote(note);
                        setSelectedNotes([note]);
                      }}
                    >
                      <div className="note-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedNotes.some(n => n.id === note.id)}
                          onChange={(e) => handleToggleNoteSelection(note, e)}
                        />
                      </div>
                      <div className="note-info">
                        <span className="note-number">#{idx + 1}</span>
                        <span className="note-pitch">Pitch: {note.pitch}</span>
                        <span className="note-velocity">Vel: {note.velocity}</span>
                        <span className="note-duration">Duration: {note.duration.toFixed(2)}s</span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedNote && (
              <div className="note-editor-section">
                <h3>Edit Note</h3>
                <div className="edit-controls">
                  <div className="control-group">
                    <label htmlFor="edit-pitch">Pitch (0-127)</label>
                    <div className="control-input">
                      <input
                        id="edit-pitch"
                        type="range"
                        min="0"
                        max="127"
                        value={selectedNote.pitch}
                        onChange={(e) => handleUpdateNote(selectedNote.id, { pitch: parseInt(e.target.value) })}
                      />
                      <span className="value">{selectedNote.pitch}</span>
                    </div>
                  </div>

                  <div className="control-group">
                    <label htmlFor="edit-velocity">Velocity (0-127)</label>
                    <div className="control-input">
                      <input
                        id="edit-velocity"
                        type="range"
                        min="0"
                        max="127"
                        value={selectedNote.velocity}
                        onChange={(e) => handleUpdateNote(selectedNote.id, { velocity: parseInt(e.target.value) })}
                      />
                      <span className="value">{selectedNote.velocity}</span>
                    </div>
                  </div>

                  <div className="control-group">
                    <label htmlFor="edit-start-time">Start Time (s)</label>
                    <input
                      id="edit-start-time"
                      type="number"
                      step="0.125"
                      value={selectedNote.startTime}
                      onChange={(e) => handleUpdateNote(selectedNote.id, { startTime: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="control-group">
                    <label htmlFor="edit-duration">Duration (s)</label>
                    <input
                      id="edit-duration"
                      type="number"
                      step="0.125"
                      value={selectedNote.duration}
                      onChange={(e) => handleUpdateNote(selectedNote.id, { duration: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="action-bar">
          <div className="action-group">
            <button className="btn btn-primary" onClick={handleSaveMIDI} disabled={loading || midiNotes.length === 0}>
              💾 Save MIDI
            </button>
            <button className="btn btn-secondary" onClick={handleLoadMIDI} disabled={loading}>
              📂 Load MIDI
            </button>
          </div>
          <div className="action-group">
            <button className="btn btn-secondary" onClick={() => setMidiNotes([])}>
              🔄 Clear All
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EditorPage;
