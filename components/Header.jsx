// components/Header.jsx
import { useState } from 'react';
// 1. Importing the CONFIG object from the project's config file
import { CONFIG } from '../config';

// Custom Link Component replacement for a single-page app structure
const NavLink = ({ href, children, isActive }) => {
  return (
    <a 
      href={href} 
      className={isActive ? 'active' : ''}
      style={{fontWeight: isActive ? 'bold' : 'normal'}}
    >
      {children}
    </a>
  );
};


export default function Header() {
  const [open, setOpen] = useState(false);
  
  // Basic routing check for current active path (for styling)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Helper to determine if a link is active
  const checkActive = (path) => currentPath === path || (path === '/' && currentPath === '/');

  // Define the light mauve color for the header background
  const lightMauve = '#E6E0E6'; // A light, gentle mauve/lavender shade
  const primaryColor = 'var(--primary-color)'; // Deep Teal/Navy

  return (
    <header 
      className="header container" 
      role="banner"
      style={{
        paddingTop: '16px', 
        paddingBottom: '16px',
        // Set background to the primary color for a professional look
        backgroundColor: primaryColor,
        color: 'white', // Ensure text is visible
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <div className="header-branding" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Placeholder for Logo/Image */}
        <img 
            src={CONFIG.LOGO} 
            alt="Customs Logo" 
            style={{ 
                height: '40px', 
                marginRight: '15px', 
                borderRadius: '50%',
                backgroundColor: 'white' // Ensure logo background is clean
            }}
        />
        <h1 className="site-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {CONFIG.SITE_TITLE}
        </h1>
      </div>
      
      {/* Desktop Navigation Links */}
      <nav className="nav-menu" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <NavLink href="/" isActive={checkActive('/')}>Home</NavLink>
        <NavLink href="/register" isActive={checkActive('/register')}>Register</NavLink>
        <NavLink href={CONFIG.DAILY_MYSTERY_PATH} isActive={checkActive(CONFIG.DAILY_MYSTERY_PATH)}>Daily Quiz</NavLink>
        <NavLink href="/leaderboard" isActive={checkActive('/leaderboard')}>Leaderboard</NavLink>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(v => !v)}
      >
        ☰
      </button>

      {open && (
        <div
          id="mobile-menu"
          style={{
            position: 'absolute',
            right: 20,
            top: 72,
            background: 'var(--surface, #fff)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            borderRadius: 'var(--radius, 12px)',
            padding: 10,
            zIndex: 60,
            minWidth: '150px'
          }}
        >
          {/* Mobile Navigation Links */}
          <a href="/" className="nav-link-mobile" style={{ display: 'block', padding: '8px 12px', fontWeight: checkActive('/') ? 'bold' : 'normal', color: primaryColor }}>Home</a>
          <a href="/register" className="nav-link-mobile" style={{ display: 'block', padding: '8px 12px', fontWeight: checkActive('/register') ? 'bold' : 'normal', color: primaryColor }}>Register</a>
          <a href={CONFIG.DAILY_MYSTERY_PATH} className="nav-link-mobile" style={{ display: 'block', padding: '8px 12px', fontWeight: checkActive(CONFIG.DAILY_MYSTERY_PATH) ? 'bold' : 'normal', color: primaryColor }}>Daily Quiz</a>
          <a href="/leaderboard" className="nav-link-mobile" style={{ display: 'block', padding: '8px 12px', fontWeight: checkActive('/leaderboard') ? 'bold' : 'normal', color: primaryColor }}>Leaderboard</a>
        </div>
      )}
    </header>
  )
}
