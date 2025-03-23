
import React from 'react';
import './Sample.css';
import { FiHelpCircle } from 'react-icons/fi';

export default function Sample() {
  return (
    <div className="container">
      {/* Background Video */}
      <div className="video-container">
        <video autoPlay loop muted playsInline className="background-video">
          <source src={process.env.PUBLIC_URL + '/Background.mp4'} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div> {/* Overlay for a cyberpunk effect */}
      </div>

      {/* Header with futuristic buttons */}
      <header className="header">
        <button className="header-button">Login</button>
        <button className="header-button">Help</button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="title">Morse Code Translator</h1>
        <button className="get-started">Get Started</button>
      </main>
    </div>
  );
}








