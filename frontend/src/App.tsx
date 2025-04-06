import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisplayUser from './pages/DisplayUser';
import VoiceChat from './pages/VoiceChat';
import './App.css';
import HomePage from './pages/homePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/voice-chat" element={<VoiceChat />} />
      </Routes>
    </Router>
  );
}

export default App;
