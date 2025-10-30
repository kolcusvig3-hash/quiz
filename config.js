// LOGO : '/logo/customs.jpg',
// LEADERBOARD_PUBLISHED_CSV :'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1336730465&single=true&output=csv', 


export const CONFIG = {
  SITE_TITLE: 'Integrity Quiz',
  REGISTRATION_FORM_URL: 'https://forms.gle/BiKFkzBa8fWfjBX9A',
  // Direct action URL for registration submission (PLACEHOLDER - UPDATE ME!)
  REGISTRATION_FORM_ACTION: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfHPSlIkbNBNJCDITKaivmmsQgJxmsVw_HJ_bsaSOVOydBj8Q/formResponse',

  //Quiz Anser form Details
  QUIZ_ANSWER_FORM_URL : 'https://forms.gle/YZbaXtaPVYGRnr6j7',
  QUIZ_ANSWER_FORM_ACTION: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScBn8U-kCgNYiPdOJd2I60T2RxoLMT2Fo1bFWIBScS8li0vnA/formResponse',
  // New: Daily Quiz Submission API Endpoint (MUST BE REPLACED WITH YOUR DEPLOYED GOOGLE APPS SCRIPT URL)
  DAILY_QUIZ_URL: 'https://script.google.com/macros/s/AKfycbxY01tlQ3RXbEdFTa5P8mZptImueXndyRr7BCcHjQjPa-QO7YJLMayq1Qhxoy_2TDUF/exec',
  // Deployment_ID:  'AKfycbxY01tlQ3RXbEdFTa5P8mZptImueXndyRr7BCcHjQjPa-QO7YJLMayq1Qhxoy_2TDUF',
  // // New: Path for the Daily Quiz Page
  DAILY_MYSTERY_PATH: '/daily-quiz',

  // New: Registration Form Entry IDs (PLACEHOLDER - UPDATE ME!)
  REGISTRATION_FIELDS: {
        fullName: 'entry.1500387478',      // Matches "Full Name"
        emailId: 'entry.147118314',       // Matches "Email ID"
        phoneNumber: 'entry.436327375',   // Matches "Phone Number"
        section: 'entry.496455143'        // Matches "Section / Division / Unit"
    },

    QUIZ_ANSWERS_FIELDS: {
        Reg_ID: 'entry.196664289',      
        DayCode: 'entry.2073045300',       
        Start_Time : 'entry.472171674',   
        End_Time : 'entry.1225226298'  ,
        Duration :  'entry.149231110',
        Q1:  'entry.29244995', 
        Q2:  'entry.457445191',     
        Q3:  'entry.2052044675', 
        Q4:  'entry.25312550', 
        Q5:  'entry.1088940276', 
        Q6:  'entry.434469021', 
        Q7:  'entry.1968693772', 
        Q8:  'entry.1184228538', 
        Q9:  'entry.358484116', 
        Q10:  'entry.1627866436', 
    },

  // LEADERBOARD_PUBLISHED_CSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1336730465&single=true&output=csv',

  // Time for the next mystery (used on index.js)
  NEXT_MYSTERY_ISO : '2025-10-27T06:30:00Z',
  LOGO : '/logo/customs.jpg',
  LEADERBOARD_PUBLISHED_CSV :'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1336730465&single=true&output=csv', 
  // in config.js
  // Public CSV URL of the Google Sheet 'Form Responses 1' tab (publish as CSV and paste URL here)
  REGISTRATION_SHEET_CSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1246262145&single=true&output=csv',
  SUBMISSION_SHEET_CSV : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1392470110&single=true&output=csv',
};

// --- QUIZ DATA & DAY LOGIC ---

// Define the fixed dates for each quiz day (IST/Kolkata timezone reference)
const DAY_CODE_MAP = [
  // Day codes are based on the IST date (27.10.2025)
  { code: 'D1', date: '2025-10-27' },
  { code: 'D2', date: '2025-10-28' },
  { code: 'D3', date: '2025-10-29' },
  { code: 'D4', date: '2025-10-30' },
  // Note: Day0 is the default practice set before Day1 starts.
];

/**
 * Determines the current day code based on the system date (checking against IST).
 * If today's date is on or after a quiz date, that quiz is available.
 */
export const getCurrentDayCode = () => {
  // Use IST (Asia/Kolkata) for accurate day determination
  const todayIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/');
  const todayYYYYMMDD = `${todayIST[2]}-${todayIST[0].padStart(2, '0')}-${todayIST[1].padStart(2, '0')}`;

  let currentCode = 'D0'; // Default to Practice set

  for (const day of DAY_CODE_MAP) {
    if (todayYYYYMMDD >= day.date) {
      currentCode = day.code; // Unlock if date is reached or passed
    }
  }

  return currentCode;
};


// Day Code: The key must match the value returned by getCurrentDayCode()
export const QUIZ_DATA = {
  D0: [
    { q: "Ethics in public administration primarily refers to?", options: { A: "The legal obligations of public servants", B: "The moral standards guiding official conduct", C: "Administrative efficiency of decision-making", D: "Political neutrality of civil services" } },
    { q: "The foundational value for a civil servant as per the Civil Services Conduct Rules is?", options: { A: "Innovation", B: "Integrity", C: "Assertiveness", D: "Ambition" } },
    { q: "Integrity in administration means?", options: { A: "Following orders from superiors", B: "Consistency between thought, speech, and action", C: "Avoidance of mistakes", D: "Non-participation in politics" } },
    { q: "The primary purpose of vigilance in government is?", options: { A: "Punishment of errant officers", B: "Preventive and corrective control to ensure integrity", C: "Surveillance of subordinates", D: "Administrative delay reduction" } },
    { q: "When legality and morality conflict, a public servant should?", options: { A: "Always follow orders", B: "Follow moral reasoning consistent with constitutional values", C: "Ignore morality", D: "Delay decision-making" } },
    { q: "Public office is a public trust. This means?", options: { A: "Officers hold office at the will of the government", B: "Officers act as trustees of public resources and interests", C: "Officers cannot be removed", D: "Officers are politically accountable" } },
    { q: "An officer facing pressure to favour a bidder should?", options: { A: "Act as per higher’s verbal instruction", B: "Record the instruction in writing and proceed transparently", C: "Ignore the file", D: "Approve for expediency" } },
    { q: "A government employee finds a wallet with ₹5,000 and official documents inside the office premises. The most ethical course of action is to?", options: { A: "Keep the money and discard the documents", B: "Hand it over to the security or lost-and-found section immediately", C: "Wait to see if someone claims it", D: "Take it home for safekeeping" } },
    { q: "The constitutional value underlying public service ethics is?", options: { A: "Liberty and Equality", B: "Patronage", C: "Expediency", D: "Seniority" } },
    { q: "The “Ethics Infrastructure” in governance refers to?", options: { A: "IT and data security systems", B: "Institutional mechanisms ensuring ethical conduct", C: "Building construction norms", D: "Internal audit procedures" } },
  ],

  D1: [
    { q: "The distinction between ethics and morality lies mainly in?", options: { A: "Ethics are personal, morality is professional", B: "Ethics are societal codes, morality is individual conscience", C: "Morality is collective, ethics are legal", D: "They mean the same" } },
    { q: "The essence of ethical governance is?", options: { A: "Maximizing public utility through just means", B: "Achieving targets irrespective of methods", C: "Maintaining secrecy of decision-making", D: "Rigidly following rules even if unjust" } },
    { q: "Which of the following best defines probity?", options: { A: "Strict obedience to authority", B: "Public duty performed with moral uprightness", C: "Maintaining confidentiality", D: "Avoiding publicity" } },
    { q: "The Central Vigilance Commission was established under recommendation of?", options: { A: "Hota Committee", B: "K. Santhanam Committee", C: "2nd ARC", D: "Administrative Reforms Commission (1966)" } },
    { q: "According to Kantian ethics, an action is moral if?", options: { A: "It brings happiness", B: "It follows a universal moral law", C: "It yields public approval", D: "It is permitted by superiors" } },
    { q: "Which among the following is not a dimension of good governance?", options: { A: "Rule of law", B: "Responsiveness", C: "Patronage", D: "Accountability" } },
    { q: "If a subordinate commits an ethical violation, the superior’s moral responsibility is?", options: { A: "Nil, unless direct benefit taken", B: "Limited to procedural lapses", C: "Shared, due to command responsibility", D: "Solely disciplinary" } },
    { q: "You are offered a gift by a client during a festival as a token of appreciation. What should you do as per conduct rules?", options: { A: "Accept without hesitation", B: "Accept and inform superior authority", C: "Decline politely and report the incident", D: "Keep it secret" } },
    { q: "Article 311 of the Constitution ensures?", options: { A: "Political neutrality", B: "Protection to civil servants from arbitrary dismissal", C: "Pension benefits", D: "Secrecy of office" } },
    { q: "Integrity Pact introduced by Transparency International aims to?", options: { A: "Prevent corruption in public procurement", B: "Improve wage structure", C: "Encourage privatization", D: "Reduce litigation" } },
  ],

  D2: [
    { q: "Which philosopher associated virtue with the 'Golden Mean'?", options: { A: "Plato", B: "Aristotle", C: "Immanuel Kant", D: "Confucius" } },
    { q: "Accountability without transparency leads to…?", options: { A: "Efficiency", B: "Arbitrary power", C: "Discipline", D: "Team cohesion" } },
    { q: "A man is honest who does not cheat even when he could do so safely. This statement refers to?", options: { A: "Fear of law", B: "Legalistic morality", C: "Integrity of character", D: "Procedural compliance" } },
    { q: "The CVC derives statutory status from?", options: { A: "CVC Act, 2003", B: "Prevention of Corruption Act, 1988", C: "Lokpal and Lokayuktas Act, 2013", D: "CCS (Conduct) Rules, 1964" } },
    { q: "Ends do not justify the means” is a key principle of?", options: { A: "Utilitarianism", B: "Deontological ethics", C: "Virtue ethics", D: "Hedonism" } },
    { q: "Transparency International measures corruption perception through?", options: { A: "Human Development Index", B: "CPI (Corruption Perception Index)", C: "Gini Coefficient", D: "WGI Index" } },
    { q: "Ethical neutrality requires that an officer?", options: { A: "Remain apolitical but not amoral", B: "Avoid ethical reasoning", C: "Support ruling party policies blindly", D: "Refrain from decision-making" } },
    { q: "A colleague regularly leaves office early but marks full attendance. What should you do?", options: { A: "Ignore", B: "Confront personally", C: "Report officially through proper channel", D: "Join them" } },
    { q: "The principle of Nemo judex in causa sua promotes?", options: { A: "Natural justice", B: "Bureaucratic hierarchy", C: "Political control", D: "Economic efficiency" } },
    { q: "The key objective of preventive vigilance is?", options: { A: "Post-facto punishment", B: "Eliminating causes leading to corruption", C: "Strengthening disciplinary rules", D: "Increasing departmental secrecy" } },
  ],

  D3: [
    { q: "The term 'public virtue' implies?", options: { A: "Loyalty to political superiors", B: "Courage to act for public good despite personal loss", C: "Following orders without questioning", D: "Avoiding criticism" } },
    { q: "Emotional intelligence helps a public servant by?", options: { A: "Making decisions based on emotions", B: "Enhancing empathy and fairness in conduct", C: "Weakening rationality", D: "Reducing accountability" } },
    { q: "Ethical leadership in government is characterized by?", options: { A: "Charismatic speech", B: "Moral courage and example-based governance", C: "Political patronage", D: "Strict subordination" } },
    { q: "A public servant accepting gratification other than legal remuneration is punishable under?", options: { A: "IPC 409", B: "Prevention of Corruption Act, 1988, Section 7", C: "CCS (CCA) Rules", D: "Conduct Rules" } },
    { q: "Utilitarian ethics judges an action by?", options: { A: "The motive behind it", B: "The legality of it", C: "The consequences it produces for the greatest number", D: "The status of the doer" } },
    { q: "Whistleblower protection is vital because?", options: { A: "It rewards informants financially", B: "It protects individuals exposing corruption", C: "It promotes a culture of silence", D: "It enables secrecy" } },
    { q: "Which of the following best exemplifies integrity under pressure?", options: { A: "Resisting temptation despite anonymity", B: "Acting ethically only under supervision", C: "Hiding mistakes", D: "Transferring responsibility" } },
    { q: "The foundation of moral conduct in public service is built upon?", options: { A: "Fear of punishment", B: "Desire for recognition", C: "Conscience and sense of duty", D: "Compliance to hierarchy" } },
    { q: "Which of these commissions emphasized “Ethics in Governance” as a reform area?", options: { A: "2nd Administrative Reforms Commission", B: "Punchhi Commission", C: "Sarkaria Commission", D: "Vohra Committee" } },
    { q: "Ethical competence in civil service includes?", options: { A: "Knowledge, skills, and moral judgment", B: "Technical proficiency only", C: "Legal compliance only", D: "Political adaptability" } },
  ],

  D4: [
{ q: "A senior officer argues that ‘rules are moral by virtue of their legality.’ Which philosophical critique most directly challenges this view?", options: { A: "Virtue ethics – focusing on individual character over compliance", B: "Legal positivism – prioritizing enacted law above morality", C: "Deontological ethics – distinguishing duty from consequence", D: "Ethical relativism – denying universal moral standards" } },
{ q: "An officer decides to withhold sensitive information from a citizen citing ‘public interest.’ Which ethical principle should guide whether this act is justified?", options: { A: "Transparency must yield to institutional loyalty", B: "Secrecy is valid if law permits it", C: "Public interest overrides both secrecy and disclosure tests", D: "Harm principle – balancing possible harm from disclosure against right to know" } },
{ q: "A public servant honestly reports financial discrepancies in a project he supervised, risking disciplinary action. His conduct primarily reflects?", options: { A: "Procedural compliance", B: "Institutional loyalty", C: "Moral autonomy and integrity", D: "Bureaucratic idealism" } },
{ q: "Preventive vigilance focuses on systemic reforms rather than punitive action. Which of the following best captures its ethical rationale?", options: { A: "Deterrence through punishment", B: "Correcting organizational incentives that enable wrongdoing", C: "Strengthening hierarchical control mechanisms", D: "Ensuring political neutrality of vigilance units" } },
{ q: "An officer must approve compensation for a disaster victim whose documents were destroyed. What ethical reasoning best supports approving the claim based on verified witnesses?", options: { A: "Rule utilitarianism – greatest good within procedural boundaries", B: "Kantian ethics – duty to uphold rule of law", C: "Virtue ethics – acting with compassion and prudence", D: "Egoism – preserving one’s own image of fairness" } },
{ q: "Which of the following best illustrates the ‘trust deficit’ in governance?", options: { A: "Excessive decentralization of power", B: "Citizens complying with laws without conviction", C: "Dependence on surveillance rather than accountability", D: "Rapid bureaucratic promotions without merit assessment" } },
{ q: "You are directed to select a vendor favored by higher authorities, though another bidder offers better value. The ethical course is to?", options: { A: "Record written dissent citing public interest and proceed lawfully", B: "Comply silently to avoid reprisal", C: "Escalate verbally without documentation", D: "Approve and justify later as ‘collective decision’" } },
{ q: "A subordinate accepts a free service from a contractor claiming ‘no personal gain.’ Which ethical flaw is evident?", options: { A: "Lack of procedural diligence", B: "Conflict of interest despite absence of monetary benefit", C: "Ethical neutrality", D: "Violation of administrative hierarchy" } },
{ q: "Which of the following best exemplifies constitutional morality in public administration?", options: { A: "Following majority will over constitutional provisions", B: "Exercising discretion guided by justice, liberty, equality, and fraternity", C: "Implementing orders irrespective of ethical implications", D: "Prioritizing administrative convenience over fairness" } },
{ q: "An e-governance system is implemented to track all approvals digitally, but officers start delaying updates fearing traceability. The ethical failure here lies in?", options: { A: "Overemphasis on digital surveillance", B: "Poor training in procedural automation", C: "Resistance to transparency due to moral insecurity", D: "Lack of political direction in implementation" } },
  ],
};

