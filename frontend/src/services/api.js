// Frontend API client service.

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const analyzeAudio = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const generateMusic = async (params) => {
  const response = await api.post('/generate', params);
  return response.data;
};

export const generateLyrics = async (params) => {
  const response = await api.post('/lyrics/generate', params);
  return response.data;
};

export const alignLyrics = async (params) => {
  const response = await api.post('/lyrics/align', params);
  return response.data;
};

export const editMIDI = async (midiData, editParams) => {
  const response = await api.post('/midi/edit', { midi_data: midiData, ...editParams });
  return response.data;
};

export const exportMIDI = async (midiData, filename) => {
  const response = await api.post('/export/midi', { midi_data: midiData, filename });
  return response.data;
};

export default api;
