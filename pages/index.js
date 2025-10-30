import React from 'react';
import { CONFIG } from '../config';

export default function Home() {
  const summary = {
    theme: "Vigilance: Our Shared Responsibility",
    dates: "October 27 to October 30, 2025",
    participants: 140,
    sections: 39,
    technology: [
      "Frontend & Backend: Next.js & Google Apps Script (AppScript)",
      "Data Collection: Embedded Google Forms",
      "Database: Google Sheets",
    ],
    winners: [
      { rank: 1, name: "UTTARAN CHOWDHURY", designation: "Preventive Officer from RTI CELL (AP & ACC)" },
      { rank: 2, name: "AASHISH KISHORE", designation: "Examiner from AG Unit" },
      { rank: 3, name: "KAILASH KUMAR CHOURASIYA", designation: "Superintendent from SIIB port" },
    ]
  };

  return (
    <main className="container">
      {/* Quiz Summary Card */}
      <div className="hero-card card" style={{ padding: '35px' }}>
        <h1 className="card-title" style={{ textAlign: 'center', fontSize: '2.2rem' }}>
          🎊 Integrity Quiz 2025 - Event Concluded 🎊
        </h1>
        
        <hr className="divider" style={{ border: 'none', borderTop: '1px solid #eee', margin: '25px 0' }} />

        {/* Vigilance Awareness Week Context */}
        <div style={{ marginBottom: '30px' }}>
          <p className="description" style={{ fontSize: '1.1rem', textAlign: 'center', lineHeight: '1.8' }}>
            The **Integrity Quiz** was successfully conducted as a part of the digital initiatives during **Vigilance Awareness Week 2025**, observed under the theme: 
            <br />
            <strong style={{ color: 'var(--accent-color-gold)', fontSize: '1.3rem' }}>"{summary.theme}"</strong>
          </p>
          <p className="description" style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
            Held from {summary.dates}.
          </p>
        </div>

        {/* Participation Statistics */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          textAlign: 'center', 
          margin: '20px 0',
          padding: '15px 0',
          backgroundColor: 'var(--surface-light)',
          borderRadius: 'var(--radius)'
        }}>
          <div>
            <p className="card-subtitle" style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>Total Participants</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--action-color-blue)' }}>{summary.participants}</p>
          </div>
          <div>
            <p className="card-subtitle" style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>Sections/Units</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--action-color-blue)' }}>{summary.sections}</p>
          </div>
        </div>
      </div>
      
      {/* Technology and Winners Section */}
      <div className="info-card" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

        {/* Technology Used */}
        <div className="card">
          <h2 className="card-title">💻 Technology Used</h2>
          <p className="description" style={{ marginBottom: '15px' }}>
            The quiz portal was developed using modern web technologies to ensure a smooth and engaging user experience:
          </p>
          <ul className="rules-list" style={{ listStyle: 'none', paddingLeft: '0' }}>
            {summary.technology.map((tech, index) => (
              <li key={index} style={{ marginBottom: '8px', color: '#555', fontWeight: '500' }}>
                <span style={{ color: 'var(--primary-color)', marginRight: '5px' }}>•</span> {tech}
              </li>
            ))}
          </ul>
        </div>

        {/* Latest Winners */}
        <div className="card">
          <h2 className="card-title">🏆 Top Winners</h2>
          <p className="description" style={{ marginBottom: '15px' }}>
            Congratulations to the top performers based on the Cumulative Total Score across the four-day competition!
          </p>
          <ol style={{ paddingLeft: '20px' }}>
            {summary.winners.map((winner) => (
              <li 
                key={winner.rank} 
                className={`description`} 
                style={{ 
                  fontWeight: winner.rank === 1 ? '700' : '600', 
                  color: winner.rank <= 3 ? 'var(--primary-color)' : '#333',
                  marginBottom: '12px',
                  padding: '5px 0',
                  borderBottom: winner.rank < summary.winners.length ? '1px dotted #eee' : 'none'
                }}
              >
                <span style={{ color: winner.rank === 1 ? 'var(--accent-color-gold)' : 'var(--action-color-blue)' }}>{winner.name}</span>, {winner.designation}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Contact Section - Separate Card for prominence */}
      <div className="card" style={{ marginTop: '20px', textAlign: 'center', borderTop: '4px solid var(--accent-color-gold)' }}>
        <h2 className="card-title" style={{ marginTop: '5px' }}>📧 Contact & Suggestions</h2>
        <p className="description">
          We welcome your feedback and suggestions for future quizzes.
        </p>
        <div style={{ marginTop: '20px' }}>
            <h3 className="card-subtitle" style={{ margin: '0' }}>Vigilance Unit — Kolkata Customs</h3>
            <p className="description" style={{ margin: '5px 0 0 0' }}>
              Email: <a href="mailto:vigilance.kol@nic.in" style={{ color: 'var(--action-color-blue)', textDecoration: 'underline', fontWeight: '600' }}>vigilance.kol@nic.in</a>
            </p>
        </div>
      </div>

    </main>
  );
}
