# musicAIssistant Frontend - Developer Quick Reference

## Quick Start

### Install Dependencies
```bash
cd frontend
npm install
```

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

---

## Component Quick Reference

### AudioUpload
```jsx
import AudioUpload from './components/AudioUpload';

<AudioUpload 
  onUpload={handleAudioUpload}      // (file) => void
  loading={isLoading}                // boolean
  analysisResults={analysis}         // { tempo, duration, key, chords }
/>
```

**Emits:** 
- `onUpload(file)` when file is selected

**Props:**
- `analysisResults`: Display detected audio properties
- `loading`: Show loading spinner

---

### GenerationControls
```jsx
import GenerationControls from './components/GenerationControls';

<GenerationControls 
  analysisResults={analysis}         // analysis data from audio
  onGenerate={handleGenerate}        // (params) => Promise<MIDI>
  loading={isLoading}                // boolean
/>
```

**Parameters Sent:**
```javascript
{
  num_steps: 32-512,
  temperature: 0.5-2.0,
  model_name: 'melody' | 'performance' | 'drums',
  seed_notes: [...] // optional
}
```

---

### EditorPage
```jsx
// Load with MIDI notes
const [midiNotes, setMidiNotes] = useState([
  {
    id: number,
    pitch: 0-127,
    velocity: 0-127,
    startTime: seconds,
    duration: seconds
  }
]);
```

**Operations:**
- `handleAddNote()` - Add new note
- `handleDeleteNote(id)` - Remove note
- `handleUpdateNote(id, updates)` - Modify note
- `handleTranspose()` - Shift all pitches
- `handleQuantize()` - Snap to grid
- `handleSaveMIDI()` - Export MIDI file

---

## API Integration

### Endpoints Expected

**Audio Analysis**
```
POST /api/analyze_audio
Body: FormData with file
Returns: {
  tempo: number,
  duration: number,
  key: string,
  chords: string[],
  detected_notes: number[]
}
```

**Music Generation**
```
POST /api/generate/melody | /generate/performance | /generate/drums
Body: {
  num_steps: number,
  temperature: number,
  seed_notes?: number[]
}
Returns: {
  notes: NoteSequence[],
  total_time: number,
  num_notes: number
}
```

**MIDI Operations**
```
POST /api/save_midi
Body: {
  notes: NoteSequence[],
  tempo: number,
  time_signature: string,
  instrument: string
}
Returns: { success: boolean, path: string }

POST /api/load_midi
Body: { file_path: string }
Returns: NoteSequence[]
```

---

## Styling System

### CSS Variables (Light Theme)
```css
--primary-color: #667eea       /* Main brand color */
--secondary-color: #764ba2     /* Secondary brand */
--accent-color: #f093fb        /* Highlights */
--success-color: #4caf50       /* Success states */
--error-color: #f44336         /* Error states */
--background-color: #fff       /* Page background */
--text-color: #333             /* Body text */
--border-color: #e0e0e0        /* Borders */
--shadow: 0 2px 8px rgba(0,0,0,0.1)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.15)
```

### Dark Theme
Set `[data-theme='dark']` on root element

### Creating New Components

**Use Variables:**
```css
.my-component {
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}
```

---

## Common Patterns

### Loading State
```jsx
{loading && <span className="spinner">Loading...</span>}
```

### Error Message
```jsx
{error && (
  <div className="error-banner">
    ⚠️ {error}
  </div>
)}
```

### Success Message
```jsx
{successMsg && (
  <div className="success-banner">
    {successMsg}
  </div>
)}
```

### Button Variants
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>
```

### Grid Layout
```jsx
<div className="analysis-grid">
  {items.map(item => (
    <div className="analysis-card" key={item.id}>
      {/* content */}
    </div>
  ))}
</div>
```

---

## File Upload Validation

```javascript
const validateFile = (file) => {
  const maxSize = 100 * 1024 * 1024;  // 100MB
  const supportedTypes = [
    'audio/wav',
    'audio/mpeg',
    'audio/ogg'
  ];
  
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported format' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  return { valid: true };
};
```

---

## Theme Management

### Switch Theme
```javascript
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('musicAI-theme', newTheme);
};
```

### Detect System Preference
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = localStorage.getItem('musicAI-theme') || 
              (prefersDark ? 'dark' : 'light');
```

---

## Responsive Design

### Breakpoints
```css
@media (max-width: 1200px) { /* Large tablets */ }
@media (max-width: 1024px) { /* Tablets */ }
@media (max-width: 768px)  { /* Small devices */ }
@media (max-width: 480px)  { /* Mobile */ }
```

### Mobile-First Approach
```css
.component {
  /* Mobile styles by default */
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .component {
    /* Tablet+ styles */
    flex-direction: row;
  }
}
```

---

## Performance Tips

1. **Memoize Components**
   ```javascript
   export default React.memo(MyComponent);
   ```

2. **Use useCallback for Handlers**
   ```javascript
   const handleClick = useCallback(() => {
     // handler code
   }, [dependencies]);
   ```

3. **Lazy Load Routes**
   ```javascript
   const EditorPage = lazy(() => import('./pages/EditorPage'));
   ```

4. **Optimize Re-renders**
   ```javascript
   const { midiNotes } = props;
   useEffect(() => {
     calculateStatistics();
   }, [midiNotes]);
   ```

---

## Debugging

### Check Browser Console
- Look for React warnings
- Check network tab for failed requests
- Monitor theme changes in localStorage

### Component Props
```javascript
console.log('Props:', props);
console.log('State:', { midiNotes, selectedNote });
```

### API Response
```javascript
fetch('/api/analyze_audio')
  .then(r => r.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Android latest

---

## Keyboard Shortcuts (Future)

- `Ctrl/Cmd + G`: Start generation
- `Ctrl/Cmd + E`: Edit MIDI
- `Ctrl/Cmd + S`: Save project
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Escape`: Close dialogs

---

## Common Issues & Solutions

### Issue: Theme not persisting
**Solution:** Check localStorage settings in privacy settings

### Issue: Audio file too large
**Solution:** Compress audio to 100MB or less, use MP3

### Issue: MIDI notes not updating
**Solution:** Check that note ID is unique, use `Math.random()` or UUID

### Issue: Generation slow
**Solution:** Reduce num_steps, check backend resources

---

## Resources

- React Documentation: https://react.dev
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- MIDI Specification: https://www.midi.org/specifications

---

## Support

For issues or questions:
1. Check the documentation in `UI_ENHANCEMENTS.md`
2. Review component props and usage examples
3. Check browser console for errors
4. Verify API endpoints are running

---

Last Updated: 2024
Version: 1.0
Status: Production-Ready
