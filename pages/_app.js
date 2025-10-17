// pages/_app.js - Global wrapper and footer
import '../styles.css'
import Header from '../components/Header'
import { CONFIG } from '../config'

// Import all required pages
import Home from './index'
import Register from './register'
import Leaderboard from './leaderboard'
import DailyQuiz from './daily_quiz' // New Import

// Simple custom router based on window.location.pathname
const Router = ({ path, pageProps }) => {
  switch (path) {
    case '/':
      return <Home {...pageProps} />
    case '/register':
      return <Register {...pageProps} />
    case '/leaderboard':
      return <Leaderboard {...pageProps} />
    case CONFIG.DAILY_MYSTERY_PATH: // New Case for Daily Quiz
      return <DailyQuiz {...pageProps} />
    default:
      // Simple 404 handler
      return (
        <div className="container" style={{textAlign: 'center', paddingTop: '50px'}}>
          <h1 style={{color: 'var(--primary-color)'}}>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <a href="/" className="link-btn" style={{marginTop: '20px'}}>Go to Home</a>
        </div>
      )
  }
}

export default function MyApp({ Component, pageProps }) {
  // Use the actual window path for routing
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const DISCLAIMER_TEXT = `
    This website is a voluntary initiative created for the specific purpose of conducting the "Integrity Mystery" quiz during Vigilance Awareness Week ${new Date().getFullYear()}. 
    This platform is hosted on a third-party, non-government server and does not represent the official digital infrastructure of the Kolkata Customs, Customs Department, or the Government of India.
    Any personal information collected is gathered solely for the purposes of running the quiz, calculating scores, and internal event reporting. This data will not be shared with any external third parties and will be deleted or anonymized upon the conclusion of the event.
    The organizers are not responsible for any technical failures, data loss, or security issues that may arise from using this third-party hosting service. Participation is voluntary and at the user's own risk.
  `

  return (
    <>
      <Header />
      <main style={{paddingTop:20}}>
        {/* Use the custom Router based on the path */}
        <Router path={currentPath} pageProps={pageProps} />
      </main>

      <footer className="container footer" style={{paddingTop:20}}>
        <div className="card">
          <details>
            <summary style={{cursor:'pointer', fontWeight:'bold'}}>Important Legal Disclaimer & Data Privacy Notice</summary>
            <p style={{whiteSpace:'pre-wrap', textAlign:'left', padding:'10px 0'}}>{DISCLAIMER_TEXT}</p>
          </details>
        </div>
        <p className="small" style={{marginTop:12}}>&copy; {new Date().getFullYear()} {CONFIG.SITE_TITLE}. All Rights Reserved.</p>
        <p className="small">Developed by Debjit Chakraborty</p>
      </footer>
      
      {/* CRITICAL FIX: Inject PapaParse script tag here.
        This is necessary because you are not using next/script or a _document.js file.
        This ensures window.Papa is available when daily_quiz.js mounts on the client.
      */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    </>
  )
}