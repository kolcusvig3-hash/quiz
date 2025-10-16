// pages/daily_quiz.js

import { useState, useEffect, useCallback } from 'react';
import { CONFIG, QUIZ_DATA, getCurrentDayCode } from '../config';
import { Clock, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Timer duration is 5 minutes (300 seconds)
const QUIZ_DURATION_SECONDS = 300;

// Recreating the MessageModal based on the register.js structure
// This fulfills the requirement to define the modal internally
const MessageModalComponent = ({ isVisible, title, content, isError, onClose }) => {
  if (!isVisible) return null;

  // Note: CSS classes like 'modal-overlay', 'modal-card', 'error-modal', 
  // and color variables (e.g., --warning-color) must be defined in your global CSS.
  return (
    <div className="modal-overlay">
      <div className={`modal-card ${isError ? 'error-modal' : 'success-modal'}`}>
        <div style={{ marginBottom: '15px' }}>
          {isError ? (
            <AlertTriangle size={40} color="var(--warning-color)" />
          ) : (
            <CheckCircle size={40} color="var(--accent-color-gold)" />
          )}
        </div>
        <h2 className="modal-title" style={{ color: isError ? 'var(--warning-color)' : 'var(--primary-color)' }}>
          {title}
        </h2>
        <p style={{ margin: '15px 0' }}>{content}</p>
        <button className="link-btn" onClick={onClose} style={{ marginTop: '10px' }}>
          Close
        </button>
      </div>
    </div>
  );
};

// Utility: simple CSV parser for the public Google Sheet CSV export
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // naive split - suitable for simple CSVs without commas inside fields
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (cols[i] || '').trim());
    return obj;
  });
}

export default function DailyQuizPage() {
  // SSR/Client state from Code 1
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Registration states from Code 1
  const [registrationId, setRegistrationId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Quiz states from Code 2
  const [dayCode, setDayCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION_SECONDS);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Status and Modal states
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'submitted', 'time_expired'
  const [messageModal, setMessageModal] = useState({ isVisible: false, title: "", content: "", isError: false });

  const isQuizActive = isVerified && submissionStatus !== 'submitted' && timeRemaining > 0;
  const isSubmissionDisabled = submissionStatus === 'submitting' || submissionStatus === 'submitted' || timeRemaining <= 0;

  const openModal = (title, content, isError = false) => setMessageModal({ isVisible: true, title, content, isError });
  const closeModal = () => setMessageModal({ ...messageModal, isVisible: false });

  // 1. Initial Data Load
  useEffect(() => {
    const currentDay = getCurrentDayCode();
    setDayCode(currentDay);
    const data = QUIZ_DATA[currentDay] || [];
    setQuestions(data);
  }, []);

  // Verify registration ID by fetching public CSV (CONFIG.REGISTRATION_SHEET_CSV)
  const verifyRegistration = async () => {
    if (!registrationId) {
      openModal('Missing Registration ID', 'Please enter your Registration ID before verifying.', true);
      return;
    }
    if (!CONFIG.REGISTRATION_SHEET_CSV) {
      openModal('Server misconfiguration', 'Please configure REGISTRATION_SHEET_CSV in config.js with the published CSV URL of your Google Sheet.', true);
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(CONFIG.REGISTRATION_SHEET_CSV);
      if (!res.ok) throw new Error('Failed to fetch registration sheet (HTTP ' + res.status + ')');
      const csvText = await res.text();
      const rows = parseCSV(csvText);

      let found = false;
      for (const r of rows) {
        // Checking for 'Registration ID' header or 6th column (index 5)
        if ((r['Registration ID'] && r['Registration ID'] === registrationId) || Object.values(r)[5] === registrationId) {
          found = true; break;
        }
      }

      if (found) {
        setIsVerified(true);
        setQuizStartTime(new Date().toISOString()); // Start time recorded on successful verification
        openModal('Verified', 'Registration ID matched. Quiz timer is starting now.', false);
      } else {
        openModal('Not registered', 'The entered Registration ID was not found. Please check and try again.', true);
      }
    } catch (err) {
      console.error(err);
      openModal('Error', 'An error occurred while validating registration: ' + err.message, true);
    } finally {
      setVerifying(false);
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleAnswerChange = useCallback((qIndex, option) => {
    if (isSubmissionDisabled) return;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [`q${qIndex + 1}`]: option // e.g., q1, q2, ..., q10
    }));
  }, [isSubmissionDisabled]);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (isSubmissionDisabled && !isAutoSubmit) return;
    if (!registrationId || !isVerified) return;

    setSubmissionStatus('submitting');
    const endTime = new Date().toISOString();

    // Generate the required 'answers' string: A|B||D|C|... (10 entries, blank for unanswered)
    const finalAnswers = questions.map((q, index) => {
      const key = `q${index + 1}`;
      return answers[key] || ''; // Send empty string if unanswered
    }).join('|');

    const payload = {
      action: 'recordQuizSubmission',
      regId: registrationId,
      dayCode: dayCode,
      startTime: quizStartTime,
      endTime: endTime,
      answers: finalAnswers // String of 10 answers separated by '|'
    };

    console.log("Submitting Payload:", payload);

    try {
      if (CONFIG.DAILY_QUIZ_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        throw new Error('Please update DAILY_QUIZ_URL in config.js with your deployed Google Apps Script URL.');
      }

      // Simple fetch with no-cors for GAS endpoint
      const response = await fetch(CONFIG.DAILY_QUIZ_URL, {
        method: 'POST',
        mode: 'no-cors', // Essential for GAS web app
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // In 'no-cors' mode, we assume success
      setSubmissionStatus('submitted');
      setTimeRemaining(0); // Stop the timer

      openModal(
        "Submission Successful!",
        `Your response for ${dayCode} has been recorded under Reg ID: ${registrationId}. Thank you for participating!`,
        false
      );

    } catch (error) {
      console.error('Quiz Submission Failed:', error);
      setSubmissionStatus('idle'); // Allow retry if network error
      setTimeRemaining(t => Math.max(t, 1)); // Reset timer if submission failed

      openModal(
        "Submission Error",
        `A network error occurred. Please check the console and try again. ${error.message}`,
        true
      );
    }
  }, [registrationId, isVerified, dayCode, quizStartTime, answers, questions, isSubmissionDisabled]);


  // 2. Timer Logic and Auto-Submit (Uses useEffect based on timeRemaining)
  useEffect(() => {
    // Only run on client after verification, and if not already submitted
    if (!isClient || !isVerified || submissionStatus === 'submitted') return;

    if (timeRemaining <= 0) {
      if (submissionStatus !== 'submitting' && submissionStatus !== 'time_expired') {
        setSubmissionStatus('time_expired');
        handleSubmit(true); // Auto-submit when time is up
      }
      return;
    }

    // Set up the interval only if quiz is active
    if (isQuizActive) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          // Prevent setting time below 0 and stop the interval
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

  }, [isClient, isVerified, timeRemaining, submissionStatus, handleSubmit, isQuizActive]); // timeRemaining dependency is intentional as requested

  return (
    <main className="container">
      <h1>Daily Integrity Quiz</h1>

      <section className="instructions card">
        <h2>Instructions</h2>
        <p>
          Enter your **Registration ID** (from your Google Form response). After successful verification, the quiz questions will be shown and the timer ({QUIZ_DURATION_SECONDS / 60} minutes) will start. Do not reload the page once the quiz has started.
        </p>
      </section>

      {/* Registration Section - Visible until verified */}
      <section className="registration card">
        <label htmlFor="regid">Registration ID</label>
        <input 
          id="regid" 
          name="regid" 
          value={registrationId} 
          onChange={e => setRegistrationId(e.target.value.trim())} 
          placeholder="Enter registration ID" 
          disabled={isVerified}
        />
        <button 
          onClick={verifyRegistration} 
          disabled={verifying || isVerified}
          className={isVerified ? 'verified-btn' : ''}
        >
          {verifying ? 'Verifying...' : (isVerified ? 'Verified' : 'Verify & Start')}
        </button>
        {isVerified && <p className="success-note">Registration verified. Quiz is now active below.</p>}
      </section>

      {/* Quiz Section - Visible only when verified and on client */}
      {isClient && isVerified && (
        <div className="card full-width quiz-card">
          <div className="quiz-header">
            <h2 className="card-title">Daily Quiz: {dayCode}</h2>
            <div className="quiz-timer-container">
              <Clock size={20} style={{ marginRight: '8px' }} />
              {/* Dynamic styling for timer warning */}
              <div id="quiz-timer" className={timeRemaining <= 60 && timeRemaining > 0 ? 'warning' : (timeRemaining <= 0 ? 'error-state' : '')}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <p className="description" style={{ fontWeight: 600 }}>
            Reg ID: <span style={{ color: 'var(--action-color-blue)' }}>{registrationId}</span> |
            Quiz Duration: {QUIZ_DURATION_SECONDS / 60} minutes |
            Total Questions: {questions.length}
          </p>
          
          {questions.length === 0 ? (
            <p className="loading-state">Loading questions for {dayCode}...</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="quiz-form">
              <div className="questions-list">
                {questions.map((q, index) => (
                  <div key={index} className="question-item card">
                    <p className="question-text">
                      <span className="question-number">Q{index + 1}.</span> {q.q}
                    </p>
                    <div className="options-group">
                      {Object.entries(q.options).map(([optionKey, optionValue]) => {
                        const isChecked = answers[`q${index + 1}`] === optionKey;
                        return (
                          <label
                            key={optionKey}
                            className={`option-label ${isChecked ? 'selected' : ''} ${isSubmissionDisabled ? 'disabled' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`question-${index + 1}`}
                              value={optionKey}
                              checked={isChecked}
                              onChange={() => handleAnswerChange(index, optionKey)}
                              disabled={isSubmissionDisabled} // Disabled prop on element
                              style={{ marginRight: '8px' }}
                            />
                            <span className="option-key">{optionKey}.</span> {optionValue}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submission Button with detailed states and visual feedback */}
              <button
                type="submit"
                disabled={isSubmissionDisabled}
                className={`submit-btn ${submissionStatus === 'submitting' ? 'submitting' : ''}`}
                style={{ marginTop: '20px' }}
              >
                {submissionStatus === 'submitting' ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : submissionStatus === 'submitted' ? (
                  <>
                    <CheckCircle size={20} style={{ marginRight: '8px' }} />
                    Submitted
                  </>
                ) : submissionStatus === 'time_expired' ? (
                  <>
                    <AlertTriangle size={20} style={{ marginRight: '8px' }} />
                    Time Expired
                  </>
                ) : (
                  <>
                    <Send size={20} style={{ marginRight: '8px' }} />
                    Final Submit
                  </>
                )}
              </button>

              <p className="small" style={{ marginTop: '10px', textAlign: 'center' }}>
                {timeRemaining <= 0 && submissionStatus !== 'submitted' ? (
                  <span className="error-state">Time has expired. Attempting auto-submission.</span>
                ) : (
                  "Click 'Final Submit' before the timer runs out. Your answers are saved automatically."
                )}
              </p>
            </form>
          )}
        </div>
      )}

      <MessageModalComponent {...messageModal} onClose={closeModal} />
    </main>
  );
}