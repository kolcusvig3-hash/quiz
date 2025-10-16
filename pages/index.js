import { useEffect, useState } from 'react';
import { CONFIG, getCurrentDayCode } from '../config'; // Import getCurrentDayCode
import Link from 'next/link';

export default function Home() {
  // Initialize with a static value for server-side rendering
  const [countdown, setCountdown] = useState('Loading...'); 
  // Add state to track if we have mounted on the client
  const [isClient, setIsClient] = useState(false); 

  const currentDayCode = getCurrentDayCode(); // Get the current active quiz day

  useEffect(() => {
    // 1. Set isClient to true immediately upon mount.
    setIsClient(true); 
    
    // Target date is pulled from CONFIG
    const target = new Date(CONFIG.NEXT_MYSTERY_ISO).getTime();
    
    // We define the interval ID here so the cleanup function can access it.
    let timer; 

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setCountdown('Mystery live now!');
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      const pad = (num) => (num < 10 ? '0' + num : num);
      
      setCountdown(`${pad(days)}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`);
    }

    // Initial tick to display time immediately
    updateCountdown();
    // Start the interval
    timer = setInterval(updateCountdown, 1000);
    
    // Cleanup function
    return () => clearInterval(timer);
  }, []);
  
  // Conditional rendering: use static value on server, dynamic value on client
  const countdownDisplay = isClient ? countdown : 'Loading...';

  return (
    <main className="container">
      {/* Hero Section Card */}
      <div className="hero-card card">
        <h1 className="hero-title">Welcome to the {CONFIG.SITE_TITLE}</h1>
        <p className="hero-description">The Integrity Mystery is a fun, daily quiz designed to promote vigilance and awareness. Participate daily to test your knowledge and climb the leaderboard!</p>
        
        <div className="link-button-group">
          <Link href="/register" className="link-btn primary">Register Now</Link>
          <Link href="/leaderboard" className="link-btn secondary">View Leaderboard</Link>
        </div>

        {/* The Rules Section is integrated here as requested by user's theme context */}
        <hr className="divider" style={{border: 'none', borderTop: '1px solid #eee', margin: '20px 0'}} />
        
        <h2 className="card-title" style={{textAlign: 'center', marginBottom: '10px'}}>How to Participate</h2>
        <ol className="rules-list">
            <li><span style={{fontWeight: '600'}}>Registration:</span> All participants must register to receive a unique Registration ID.</li>
            <li><span style={{fontWeight: '600'}}>Daily Mystery:</span> A new question is released daily at 12:00 PM IST and remains available for 24 hours.</li>
            <li><span style={{fontWeight: '600'}}>Submission:</span> Use your Registration ID to submit your answer on the <Link href={CONFIG.DAILY_MYSTERY_PATH} style={{color: 'var(--action-color-blue)', textDecoration: 'underline'}}>Daily Mystery Page</Link>.</li>
            <li><span style={{fontWeight: '600'}}>Scoring:</span> Correct answers are awarded points, and an updated leaderboard is posted daily.</li>
        </ol>

        {/* Countdown to Next Mystery Card */}
        <hr className="divider" style={{border: 'none', borderTop: '1px solid #eee', margin: '20px 0'}} />
            
        <h3 className="card-subtitle" style={{textAlign: 'center'}}>Next Mystery Starts In</h3>
        {/* Use the conditional display variable */}
        <p className="countdown-timer">{countdownDisplay}</p>
        
        {/* New link button below the countdown */}
        <div className="link-button-group" style={{justifyContent: 'center'}}>
          <Link href={CONFIG.DAILY_MYSTERY_PATH} className="link-btn">Go to {currentDayCode} Quiz</Link>
        </div>
            
      </div>

      {/* Contact & Winners Card */}
      <div className="info-card">
        <h2 className="card-title">Contact & Winners</h2>
        <div style={{ marginBottom: '20px' }}>
            <h3 className="card-subtitle">Contact</h3>
            <p className="description">Vigilance Unit — Kolkata Customs</p>
            <p className="description">Email: <a href="mailto:vigilance.kol@nic.in" style={{color: 'var(--action-color-blue)'}}>vigilance.kol@nic.in</a></p>
        </div>

        <hr className="divider" style={{border: 'none', borderTop: '1px solid #eee', margin: '20px 0'}} />

        <div>
            <h3 className="card-subtitle">Latest Winners</h3>
            <p className="description">Top performers will be announced here after the conclusion of the event.</p>
        </div>
      </div>
    </main>
  );
}
