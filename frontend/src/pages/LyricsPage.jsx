import React, { useState } from 'react';
import { generateLyrics, alignLyrics } from '../services/api';
import './LyricsPage.css';

function LyricsPage({ currentProject }) {
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('pop');
  const [mood, setMood] = useState('upbeat');
  const [midiNotes, setMidiNotes] = useState([]);
  const [alignmentData, setAlignmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateLyrics = async () => {
    setLoading(true);
    try {
      const result = await generateLyrics({ style, mood, num_lines: 4 });
      setLyrics(result.lyrics);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAlignLyrics = async () => {
    if (!lyrics || midiNotes.length === 0) {
      alert('Please generate lyrics and load MIDI first');
      return;
    }

    setLoading(true);
    try {
      const result = await alignLyrics({
        lyrics,
        midi_data: { notes: midiNotes },
        tempo_bpm: 120
      });
      setAlignmentData(result);
    } catch (err) {
      alert(`Alignment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lyrics-page">
      <div className="lyrics-container">
        <h2>Lyrics Generation & Alignment</h2>

        <div className="generation-panel">
          <h3>Generate Lyrics</h3>
          <div className="controls">
            <div className="control-group">
              <label>Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="hip-hop">Hip-Hop</option>
                <option value="folk">Folk</option>
              </select>
            </div>

            <div className="control-group">
              <label>Mood</label>
              <select value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="upbeat">Upbeat</option>
                <option value="melancholic">Melancholic</option>
                <option value="energetic">Energetic</option>
                <option value="peaceful">Peaceful</option>
                <option value="romantic">Romantic</option>
              </select>
            </div>

            <button onClick={handleGenerateLyrics} disabled={loading}>
              {loading ? 'Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {lyrics && (
          <div className="lyrics-editor">
            <h3>Lyrics</h3>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Edit your lyrics here..."
            />
          </div>
        )}

        {lyrics && (
          <div className="alignment-panel">
            <h3>Align with MIDI</h3>
            <button onClick={handleAlignLyrics} disabled={loading}>
              {loading ? 'Aligning...' : '🎵 Align Lyrics to MIDI'}
            </button>
          </div>
        )}

        {alignmentData && (
          <div className="alignment-results">
            <h3>Alignment Results</h3>
            <p className="success">✓ Lyrics aligned successfully!</p>
            <div className="alignment-info">
              <span>Syllables: {alignmentData.syllable_mapping ? Object.keys(alignmentData.syllable_mapping).length : 0}</span>
              <span>Notes: {alignmentData.aligned_notes?.length || 0}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default LyricsPage;
