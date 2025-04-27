import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Cricket Stats Hub</h1>
        <p className="subtitle">Your Ultimate Cricket Statistics Destination</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            To provide cricket enthusiasts with comprehensive, accurate, and up-to-date
            cricket statistics, making the rich history and exciting present of cricket
            accessible to everyone.
          </p>
        </section>

        <section className="features-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Live Statistics</h3>
              <p>Real-time updates from matches around the globe</p>
            </div>
            <div className="feature-card">
              <h3>Player Profiles</h3>
              <p>Detailed statistics and career information for players</p>
            </div>
            <div className="feature-card">
              <h3>Team Analysis</h3>
              <p>Comprehensive team performance metrics and history</p>
            </div>
            <div className="feature-card">
              <h3>Historical Data</h3>
              <p>Archive of cricket statistics dating back decades</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            We are a dedicated team of cricket enthusiasts, statisticians, and
            developers working together to bring you the most comprehensive cricket
            statistics platform.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;