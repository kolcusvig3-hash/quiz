import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// This line correctly imports dependencies from the separate config.js file
import { CONFIG, QUIZ_DATA, getCurrentDayCode } from '../config';
// Import necessary icons
import { Clock, Send, AlertTriangle, CheckCircle } from 'lucide-react';

// --- CONSTANTS ---
const MAX_TIME_SECONDS = 300; // 5 minutes
const REG_ID_COLUMN_INDEX = 5; // Column F in REGISTRATION_SHEET_CSV (Assuming 0-indexed)
const DUPLICATE_REG_ID_INDEX = 1; // Column B in SUBMISSION_SHEET_CSV (Assuming 0-indexed)
const DUPLICATE_DAY_CODE_INDEX = 2; // Column C in SUBMISSION_SHEET_CSV (Assuming 0-indexed)

// --- UTILITIES ---

/**
 * Formats seconds into MM:SS string.
 * @param {number} totalSeconds 
 * @returns {string} Formatted time string.
 */
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Gets the current time formatted for the submission log (IST).
 * @returns {string} Timestamp (e.g., "MM/DD/YYYY, HH:MM:SS AM/PM IST").
 */
const getFormattedTime = () => {
    const now = new Date();
    // Use the standard toLocaleString format which is more robust
    return now.toLocaleString('en-US', { 
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true, // Use AM/PM as this is often easier for Google Sheets to interpret correctly
    }) + ' IST';
};


// --- UI COMPONENTS ---

/**
 * Custom Modal Component for notifications (Recreated to match original appearance structure).
 */
const MessageModalComponent = ({ isVisible, title, content, isError, onClose }) => {
    if (!isVisible) return null;

    // Mapping original styles to inline/class names
    const warningColor = '#FFC107'; // A shade of gold/yellow for warning
    const accentColorGold = '#FFC107'; // Gold for success
    const primaryColor = '#1F2937'; // Dark gray for general text/title

    return (
        <div className="modal-overlay fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className={`modal-card bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transition-all duration-300 transform ${isError ? 'error-modal border-4 border-red-500' : 'success-modal border-4 border-yellow-500'}`}>
                <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    {isError ? (
                        <AlertTriangle size={40} color={warningColor} style={{ margin: '0 auto' }} />
                    ) : (
                        <CheckCircle size={40} color={accentColorGold} style={{ margin: '0 auto' }} />
                    )}
                </div>
                <h2 className="modal-title text-center text-xl font-bold" style={{ color: isError ? warningColor : primaryColor }}>
                    {title}
                </h2>
                <p className="text-gray-700 text-center" style={{ margin: '15px 0' }}>{content}</p>
                <button 
                    className="link-btn w-full py-2 mt-4 rounded-lg font-semibold transition duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300" 
                    onClick={onClose} 
                    style={{ marginTop: '10px' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

/**
 * Single MCQ Item Component. (Modified to match image styling)
 */
const QuizItem = ({ index, question, options, selectedAnswer, onSelect, disabled }) => {
    const optionKeys = ['A', 'B', 'C', 'D'];
    return (
        // Replicate card structure from the original image (p-0 to be able to set inner spacing)
        <div className="question-item card p-0 bg-white shadow rounded-lg mb-4 border border-gray-200">
            <p className="question-text p-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
                <span className="question-number text-indigo-600 mr-2">Q{index}.</span> {question.q}
            </p>
            <div className="options-group grid grid-cols-2 gap-3 p-4">
                {optionKeys.map(key => {
                    const isChecked = selectedAnswer === key;
                    return (
                        // Replicate the option button look
                        <label 
                            key={key} 
                            className={`
                                option-label flex items-center justify-center p-3 rounded-md cursor-pointer transition-all duration-100 font-medium 
                                ${isChecked ? 'selected bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'} 
                                ${disabled ? 'disabled opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            <input
                                type="radio"
                                name={`q${index}`}
                                value={key}
                                checked={isChecked}
                                onChange={() => !disabled && onSelect(index - 1, key)} // Index is 0-based for state, 1-based for display
                                disabled={disabled}
                                // Hide the default radio button visually, as the parent label handles the selection style
                                style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                            />
                            <span className="option-key mr-1 font-bold">{key}.</span> {options[key]}
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Renders a fixed (floating) timer for continuous visibility.
 * ⭐ NEW COMPONENT FOR FLOATING TIMER ⭐
 */
const FloatingTimer = ({ secondsLeft, quizStarted, submissionCompleted }) => {
    // Only display if the quiz has started and hasn't been completed
    if (!quizStarted || submissionCompleted) return null;

    const timerClass = secondsLeft <= 60 && secondsLeft > 0 
        ? 'warning' 
        : (secondsLeft <= 0 ? 'error-state' : '');

    return (
        <div className="fixed-timer-container">
            <div 
                id="quiz-timer-floating" 
                className={`fixed-timer-text ${timerClass}`}
                // Use inline styles to override the color based on timer state
                style={{ color: secondsLeft <= 0 ? '#DC2626' : (secondsLeft <= 60 ? '#FBBF24' : '#1F2937') }}
            >
                {/* Clock icon with a fixed color */}
                <Clock size={24} style={{ marginRight: '8px', color: '#4F46E5' }} /> 
                {formatTime(secondsLeft)}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

export default function DailyQuiz() {
    // Determine the current quiz day based on system time (IST)
    const dayCode = useMemo(() => getCurrentDayCode(), []);
    // Use D0 for testing/fallback if the specific day's quiz isn't defined
    const quizContent = useMemo(() => QUIZ_DATA[dayCode] || QUIZ_DATA['D0'], [dayCode]);
    
    // State for user input and form status
    const [regId, setRegId] = useState('');
    const [answers, setAnswers] = useState(Array(10).fill('')); // Q1 to Q10
    
    // State for quiz control
    const [quizStarted, setQuizStarted] = useState(false); 
    const [secondsLeft, setSecondsLeft] = useState(MAX_TIME_SECONDS); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionCompleted, setSubmissionCompleted] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    
    // Ref to store immutable timestamps
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);

    // Custom Modal/Message Box State
    const [messageModal, setMessageModal] = useState({
        isVisible: false,
        title: '',
        content: '',
        isError: false,
    });
    
    // --- HANDLERS ---

    const handleAnswerSelect = (index, answer) => {
        if (submissionCompleted || secondsLeft === 0) return; // Add time check to prevent late answers
        const newAnswers = [...answers];
        newAnswers[index] = answer;
        setAnswers(newAnswers);
    };

    const closeModal = () => {
        setMessageModal(prev => ({ ...prev, isVisible: false }));
    };

    // --- CHECK LOGIC (Unchanged) ---

    /**
     * Checks if the Reg ID is registered against the published CSV.
     */
    const validateRegId = async () => {
        if (!window.Papa) {
             setMessageModal({
                 isVisible: true,
                 title: 'Library Missing',
                 content: 'CSV parsing library (PapaParse) is not loaded. Please ensure the script tag is working.',
                 isError: true,
             });
             return false;
        }

        setIsValidating(true);
        
        try {
            const response = await fetch(CONFIG.REGISTRATION_SHEET_CSV);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();

            let found = false;
            
            // PapaParse is synchronous here, which is fine for small files
            window.Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: function(results) {
                    const trimmedRegId = regId.trim();
                    // Assuming REG_ID_COLUMN_INDEX is the 6th column (F, index 5)
                    for (const row of results.data) {
                        // Ensure the row has enough columns and the Reg ID column value matches
                        if (row.length > REG_ID_COLUMN_INDEX && row[REG_ID_COLUMN_INDEX] && String(row[REG_ID_COLUMN_INDEX]).trim() === trimmedRegId) {
                            found = true;
                            break;
                        }
                    }
                }
            });

            setIsValidating(false);

            if (found) {
                return true;
            } else {
                setMessageModal({
                    isVisible: true,
                    title: 'Validation Failed',
                    content: `Registration ID "${regId}" was not found in the approved list. Please check for typos.`,
                    isError: true,
                });
                return false;
            }

        } catch (error) {
            console.error('Registration List Fetch/Parse Error:', error);
            setIsValidating(false);
            setMessageModal({
                isVisible: true,
                title: 'Network Error',
                content: 'Could not connect to the registration list for validation. Please check your network.',
                isError: true,
            });
            return false;
        }
    };
    
    /**
     * Checks if the Reg ID and DayCode combination has already been submitted.
     */
    const checkDuplicateSubmission = async () => {
        if (!window.Papa) return false;

        try {
            const response = await fetch(CONFIG.SUBMISSION_SHEET_CSV);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();

            let isDuplicate = false;
            
            window.Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: function(results) {
                    const trimmedRegId = regId.trim();
                    const trimmedDayCode = dayCode;
                    
                    // Check every row for a match of both RegId (Col B, index 1) and DayCode (Col C, index 2)
                    for (const row of results.data) {
                        const rowRegId = row[DUPLICATE_REG_ID_INDEX]?.trim();
                        const rowDayCode = row[DUPLICATE_DAY_CODE_INDEX]?.trim();

                        if (rowRegId === trimmedRegId && rowDayCode === trimmedDayCode) {
                            isDuplicate = true;
                            break;
                        }
                    }
                }
            });

            return isDuplicate;

        } catch (error) {
            console.error('Submission Log Fetch/Parse Error:', error);
            // In case of network error on final check, warn but allow submit if necessary
            setMessageModal({
                isVisible: true,
                title: 'Warning: Network Check Failed',
                content: 'Could not verify prior submissions due to a network error. You may submit, but risk duplicate rejection by the server.',
                isError: true,
            });
            // Return false to allow submission (assuming the form will handle the ultimate integrity check)
            return false; 
        }
    };


    // --- SUBMISSION LOGIC (MODIFIED) ---

    const handleSubmit = useCallback(async (isAuto) => {
        if (isSubmitting || submissionCompleted) return;

        if (!regId) {
            setMessageModal({ isVisible: true, title: 'Submission Error', content: 'Registration ID is missing.', isError: true });
            return;
        }
        
        // 1. Set End Time & Calculate Duration
        endTimeRef.current = getFormattedTime();
        // Ensure duration is always positive or zero
        const durationSeconds = Math.max(0, MAX_TIME_SECONDS - secondsLeft);

        // 2. Check for duplicate submission
        setIsSubmitting(true);
        const isDuplicate = await checkDuplicateSubmission();

        if (isDuplicate) {
            setIsSubmitting(false);
            setSubmissionCompleted(true);
            setMessageModal({
                isVisible: true,
                title: 'Submission Rejected',
                content: `Your Registration ID (${regId}) has already submitted an answer for ${dayCode}. Only one attempt is allowed.`,
                isError: true,
            });
            return;
        }
        
        // 3. Proceed with Google Form Submission
        
        const formData = new URLSearchParams();
        
        // Map required fields
        formData.append(CONFIG.QUIZ_ANSWERS_FIELDS.Reg_ID, regId); 
        formData.append(CONFIG.QUIZ_ANSWERS_FIELDS.DayCode, dayCode);
        formData.append(CONFIG.QUIZ_ANSWERS_FIELDS.Start_Time, startTimeRef.current || 'NA');
        formData.append(CONFIG.QUIZ_ANSWERS_FIELDS.End_Time, endTimeRef.current || 'NA');
        formData.append(CONFIG.QUIZ_ANSWERS_FIELDS.Duration, durationSeconds.toString());

        // Map Q1 to Q10 answers
        for (let i = 0; i < 10; i++) {
            const fieldKey = `Q${i + 1}`;
            const entryId = CONFIG.QUIZ_ANSWERS_FIELDS[fieldKey];
            // *** LOGIC IMPLEMENTED: If answers[i] is blank (""), use "X" instead. ***
            const answerValue = answers[i] || 'X'; 
            formData.append(entryId, answerValue);
        }

        try {
            await fetch(CONFIG.QUIZ_ANSWER_FORM_ACTION, {
                method: 'POST',
                body: formData,
                mode: 'no-cors', // Essential for successful Google Form submissions
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            
            // Success response (even if no-cors is used, we assume success if fetch resolves)
            setSubmissionCompleted(true);
            setSecondsLeft(0);

            setMessageModal({
                isVisible: true,
                title: isAuto ? 'Time Expired - Auto-Submitted' : 'Submission Successful!',
                content: `Your answers for ${dayCode} have been successfully submitted in ${durationSeconds} seconds!`,
                isError: false,
            });

        } catch (error) {
            console.error('Google Form Submission error:', error);
            setMessageModal({
                isVisible: true,
                title: 'Submission Failed',
                content: 'A network error occurred during submission. Please check your connection.',
                isError: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [regId, dayCode, answers, secondsLeft, isSubmitting, submissionCompleted]);

    // --- TIMER EFFECTS (Unchanged) ---

    useEffect(() => {
        let timer;
        if (quizStarted && secondsLeft > 0 && !submissionCompleted) {
            timer = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0 && quizStarted && !submissionCompleted) {
            // Auto-submit when time is up
            handleSubmit(true); 
        }

        return () => clearInterval(timer);
    }, [quizStarted, secondsLeft, submissionCompleted, handleSubmit]);

    // --- START QUIZ LOGIC (Unchanged) ---

    const handleStartQuiz = async () => {
        if (isValidating || quizStarted || submissionCompleted || isSubmitting) return;

        if (!regId) {
            setMessageModal({
                isVisible: true,
                title: 'Missing Registration ID',
                content: 'Please enter your Registration ID to start the quiz.',
                isError: true,
            });
            return;
        }
        
        // 1. Validation Check (Is the ID registered?)
        const isRegIdValid = await validateRegId();

        if (isRegIdValid) {
            // 2. Duplicate Check (Has the ID already submitted today?)
            const isDuplicate = await checkDuplicateSubmission();
            if (isDuplicate) {
                setMessageModal({
                    isVisible: true,
                    title: 'Quiz Already Attempted',
                    content: `Your Registration ID (${regId}) has already submitted an answer for ${dayCode}. Only one attempt is allowed.`,
                    isError: true,
                });
                return;
            }

            // 3. Start the quiz!
            startTimeRef.current = getFormattedTime(); // Capture start time
            setQuizStarted(true);
        }
    };


    // --- RENDER ---
    const isQuizLocked = submissionCompleted || secondsLeft === 0;

    return (
        <>
            {/* PapaParse CDN for CSV Parsing is required for external CSV data checks */}
            <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>

            {/* Replicating the outer container/styling */}
            <div className="container min-h-screen bg-white p-4 font-sans">
                <style jsx global>{`
                    /* Define colors used in the original image's styling (based on variables in the other code) */
                    :root {
                        // --primary-color: #000080d5; /* Dark Gray */
                        --accent-color-gold: #FFC107; /* Gold/Yellow */
                        --action-color-blue: #4F46E5; /* Indigo 600 */
                        --warning-color: #FBBF24; /* Amber 400 */
                        --success-color: #10B981; /* Green 500 */
                        --submit-button-color: #E27B3A; /* Custom warm brown/orange for submit */
                        --submit-hover-color: #C76D33;
                    }
                    
                    /* Global styles for card and button appearance matching the first code snippet */
                    .container { max-width: 900px; margin: 0 auto; padding: 20px 0; }
                    // h1 { color: var(--primary-color); font-size: 2rem; font-weight: 700; margin-bottom: 20px; text-align: center; }
                    .card {
                        background-color: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
                        padding: 20px;
                        margin-bottom: 20px;
                        border: 1px solid #E5E7EB; /* Light border */
                    }
                    .registration button, .submit-btn {
                        padding: 14px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1rem;
                    }
                    .registration button {
                        background-color: var(--action-color-blue);
                        color: white;
                        border: none;
                    }
                    .registration button:hover:not(:disabled) { background-color: #3730A3; } /* Indigo 800 */
                    .registration button:disabled { opacity: 0.6; cursor: not-allowed; }
                    .success-note { color: var(--success-color); font-weight: 500; margin-top: 10px; text-align: center; }

                    /* Quiz Header Styling */
                    .quiz-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 0;
                        border-bottom: 1px solid #E5E7EB;
                        margin-bottom: 15px;
                    }
                    .quiz-timer-container {
                        display: flex;
                        align-items: center;
                        background-color: #F3F4F6; /* Gray 100 */
                        padding: 8px 12px;
                        border-radius: 8px;
                        font-weight: 700;
                        color: var(--primary-color);
                        box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    }
                    #quiz-timer.warning { color: var(--warning-color); }
                    #quiz-timer.error-state { color: #DC2626; } /* Red 600 */

                    /* Question Item Styling (Defined in QuizItem component with classes, but here for reference) */
                    .option-label.selected {
                        background-color: var(--action-color-blue) !important;
                        color: white !important;
                        border-color: var(--action-color-blue) !important;
                    }
                    
                    /* Submit Button Styling */
                    .submit-btn {
                        background-color: var(--submit-button-color); /* Custom brown/orange */
                        color: white;
                        border: none;
                        text-transform: uppercase;
                    }
                    .submit-btn:hover:not(:disabled) { background-color: var(--submit-hover-color); }
                    .submit-btn.submitting { background-color: #FBBF24; color: var(--primary-color); } /* Amber 400 */
                    
                    /* ⭐ NEW FLOATING TIMER CSS ⭐ */
                    .fixed-timer-container {
                        position: fixed; /* Key for floating effect */
                        bottom: 20px;    /* 20px from the bottom edge */
                        right: 20px;     /* 20px from the right edge */
                        z-index: 40;     /* Ensures it stays above all other content */
                        
                        /* Styling matching the existing timer look */
                        background-color: white;
                        border: 2px solid #4F46E5; /* Indigo 600 */
                        padding: 12px;
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                        min-width: 120px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    }
                    
                    .fixed-timer-text {
                        font-weight: 700;
                        font-size: 1.25rem; /* Equivalent to text-xl */
                        display: flex;
                        align-items: center;
                    }
                    .fixed-timer-text.warning { color: var(--warning-color, #FBBF24); }
                    .fixed-timer-text.error-state { color: #DC2626; } 
                    
                `}</style>

                {/* Custom Notification Modal */}
                <MessageModalComponent 
                    isVisible={messageModal.isVisible}
                    title={messageModal.title}
                    content={messageModal.content}
                    isError={messageModal.isError}
                    onClose={closeModal}
                />

                <main className="max-w-4xl mx-auto p-4 md:p-0">
                    
                    {/* Registration Section - Replicating the 'instructions' and 'registration' blocks into one card */}
                    <section className="card registration">
                        <h2 className="text-xl font-bold mb-3 text-center">Daily Integrity Quiz ({dayCode})</h2>
                        
                        {/* Status bar/Info bar */}
                        <div className="quiz-header !p-0 !border-b-0 mb-4">
                            {/* <h3 className="text-base font-semibold text-gray-700">Daily Quiz: Day {dayCode.slice(1)}</h3> */}
                            <h3 className="font-bold text-indigo-800 text-lg mb-2">Instructions:</h3>
                            <ul className="list-disc list-inside ml-2 text-base space-y-1">
                                <li>Enter your **Registration ID** to begin.</li>
                                <li>The quiz consists of **10 Multiple Choice Questions**.</li>
                                <li>You have **{formatTime(MAX_TIME_SECONDS)}** minutes to complete the quiz.</li>
                                <li>**Only one submission is permitted per Registration ID** for this day.</li>
                            </ul>
                            
                            {/* ⭐ REMOVED TIMER DISPLAY FROM HERE ⭐
                            {quizStarted && (
                                <div className="quiz-timer-container">
                                    <Clock size={20} style={{ marginRight: '8px' }} />
                                    <div 
                                        id="quiz-timer" 
                                        className={secondsLeft <= 60 && secondsLeft > 0 ? 'warning' : (secondsLeft <= 0 ? 'error-state' : '')}
                                    >
                                        {formatTime(secondsLeft)}
                                    </div>
                                </div>
                            )}
                            */}
                            
                        </div>

                        <p className="description text-sm text-gray-600 mb-4" style={{ fontWeight: 600 }}>
                            Reg ID: <span style={{ color: 'var(--action-color-blue)' }}>{quizStarted || submissionCompleted ? regId : 'Pending'}</span> |
                            Quiz Duration: {MAX_TIME_SECONDS / 60} minutes |
                            Total Questions: {quizContent.length}
                        </p>
                        
                        {/* Registration Input/Button Area */}
                        {!quizStarted && !submissionCompleted && (
                            <div className="flex flex-col md:flex-row items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="input-area flex-grow w-full">
                                    <label htmlFor="regId" className="block text-sm font-medium text-gray-700 mb-1">Registration ID</label>
                                    <input
                                        id="regId"
                                        className="input"
                                        type="text"
                                        placeholder="Enter registration ID"
                                        value={regId}
                                        onChange={(e) => setRegId(e.target.value.toUpperCase().trim())}
                                        disabled={quizStarted || submissionCompleted || isValidating || isSubmitting}
                                        required
                                    />
                                </div>
                                
                                <button 
                                    className="w-full md:w-auto mt-2 md:mt-0"
                                    onClick={handleStartQuiz} 
                                    disabled={!regId || isValidating || isSubmitting}
                                >
                                    {isValidating ? 'Verifying...' : 'Verify & Start'}
                                </button>
                            </div>
                        )}
                        {quizStarted && !submissionCompleted && <p className="success-note text-center">Registration verified. Quiz is now active below. **DO NOT REFRESH.**</p>}
                        {submissionCompleted && <p className="text-lg font-semibold text-green-600 p-3 bg-green-50 rounded-lg w-full text-center mt-4">✅ Submission Completed.</p>}

                    </section>

                    {/* Quiz Section - Visible only when started */}
                    {quizStarted && (
                        <div className="quiz-card">
                            
                            {/* Questions List */}
                            <div className="questions-list">
                                {quizContent.map((item, index) => (
                                    <QuizItem
                                        key={index}
                                        index={index + 1}
                                        question={item}
                                        options={item.options}
                                        selectedAnswer={answers[index]}
                                        onSelect={handleAnswerSelect}
                                        disabled={isQuizLocked}
                                    />
                                ))}
                            </div>

                            {/* Submission Button Section (Replicated styling from image) */}
                            <div className="card sticky bottom-0 z-10 p-4 border-t-4 border-gray-300">
                                <button
                                    type="button" // Change to button since the whole form is just this page
                                    onClick={() => handleSubmit(false)} 
                                    disabled={isQuizLocked || isSubmitting}
                                    className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            {/* Spinner (Visual component for submitting state) */}
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : isQuizLocked ? (
                                        <>
                                            <CheckCircle size={20} style={{ marginRight: '8px' }} />
                                            Submitted
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} style={{ marginRight: '8px' }} />
                                            Final Submit
                                        </>
                                    )}
                                </button>

                                <p className="small text-sm" style={{ marginTop: '10px', textAlign: 'center', color: '#6B7280' }}>
                                    {secondsLeft <= 0 && !submissionCompleted ? (
                                        <span className="error-state" style={{ color: '#DC2626' }}>Time has expired. Attempting auto-submission.</span>
                                    ) : (
                                        "Click 'Final Submit' before the timer runs out. Your answers are saved automatically."
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </main>
                
                {/* ⭐ CALL NEW FLOATING TIMER COMPONENT HERE ⭐ */}
                <FloatingTimer 
                    secondsLeft={secondsLeft} 
                    quizStarted={quizStarted} 
                    submissionCompleted={submissionCompleted}
                />
            </div>
        </>
    );
}