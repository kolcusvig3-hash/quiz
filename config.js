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
    { q: "Q1: The primary function of Customs is?", options: { A: "Collecting Income Tax", B: "Facilitating Trade and Securing Borders", C: "Issuing Passports", D: "Managing Railways" } },
    { q: "Q2: What does IGST stand for?", options: { A: "Internal Goods and Service Tax", B: "Integrated Goods and Service Tax", C: "India Global Service Tax", D: "Inter-state Goods Supply Tax" } },
    { q: "Q3: The concept of integrity focuses on?", options: { A: "External appearance", B: "Adherence to moral and ethical principles", C: "Speed of work", D: "Political affiliation" } },
    { q: "Q4: How many MCQs are in today's quiz?", options: { A: "5", B: "8", C: "10", D: "12" } },
    { q: "Q5: The time limit for this quiz is?", options: { A: "10 minutes", B: "5 minutes", C: "3 minutes", D: "7 minutes" } },
    { q: "Q6: Which document is crucial for import clearance?", options: { A: "Driving License", B: "Bill of Entry", C: "Aadhaar Card", D: "Voter ID" } },
    { q: "Q7: A key principle of the 'Ease of Doing Business' initiative is?", options: { A: "More documentation", B: "Reduced interface", C: "Higher tariffs", D: "Slower clearance" } },
    { q: "Q8: Full form of EDI in the Customs context?", options: { A: "Electronic Document Integration", B: "External Data Interface", C: "Electronic Data Interchange", D: "Efficient Document Indexing" } },
    { q: "Q9: The color associated with the Indian Customs service is often?", options: { A: "Green", B: "Red", C: "Blue", D: "Maroon" } },
    { q: "Q10: This quiz is part of which event?", options: { A: "Customs Day", B: "Vigilance Awareness Week", C: "Independence Day", D: "Republic Day" } },
  ],
  D1: [
    { q: "Day 1, Q1: What is the highest civil service award in India?", options: { A: "Padma Vibhushan", B: "Bharat Ratna", C: "Kirti Chakra", D: "Ashok Chakra" } },
    { q: "Day 1, Q2: Which legal provision deals with the offence of smuggling under the Customs Act?", options: { A: "Section 135", B: "Section 149", C: "Section 104", D: "Section 151" } },
    { q: "Day 1, Q3: The Central Vigilance Commission (CVC) was established based on the recommendations of which committee?", options: { A: "Narasimham Committee", B: "Santhanam Committee", C: "Jain Committee", D: "Tandon Committee" } },
    { q: "Day 1, Q4: What is the full form of 'CBIC'?", options: { A: "Central Board of Income Collection", B: "Central Board of Indirect Taxes and Customs", C: "Central Bureau of International Commerce", D: "Central Budgetary Information Committee" } },
    { q: "Day 1, Q5: The concept of 'Duty Drawback' is related to?", options: { A: "Import subsidies", B: "Refund of duty on exported goods", C: "Tax on services", D: "A penalty fee" } },
    { q: "Day 1, Q6: When is Vigilance Awareness Week typically observed?", options: { A: "The birthday of Mahatma Gandhi", B: "The last week of October, coinciding with Sardar Vallabhbhai Patel's birthday", C: "The first week of January", D: "The week after Diwali" } },
    { q: "Day 1, Q7: Which term describes the unauthorized removal of dutiable goods from a warehouse?", options: { A: "Pilferage", B: "Misdeclaration", C: "Evasion", D: "Abstract" } },
    { q: "Day 1, Q8: What does 'KYC' stand for in banking and finance?", options: { A: "Keep Your Cash", B: "Know Your Customer", C: "Key Yield Calculation", D: "Knowledge of Your Company" } },
    { q: "Day 1, Q9: What is the primary purpose of a 'Shipping Bill'?", options: { A: "Import clearance", B: "Export clearance", C: "Road transport permit", D: "Financial audit" } },
    { q: "Day 1, Q10: What is the maximum value of gold a resident Indian male can import duty-free after being abroad for more than a year?", options: { A: "₹25,000", B: "₹50,000", C: "₹1,00,000", D: "No limit" } },
  ],
  D2: [
    { q: "Day 2, Q1: The acronym 'FTP' in trade policy refers to?", options: { A: "Fixed Tax Policy", B: "Foreign Trade Pact", C: "Foreign Trade Policy", D: "Free Trade Protocol" } },
    { q: "Day 2, Q2: 'Manifest' is a document related to the cargo carried by which mode of transport?", options: { A: "Road", B: "Rail", C: "Air or Sea", D: "Pipeline" } },
    { q: "Day 2, Q3: What is the primary role of the Directorate General of Revenue Intelligence (DRI)?", options: { A: "Tax calculation", B: "Anti-smuggling and Customs fraud investigation", C: "GST refunds", D: "Service tax assessment" } },
    { q: "Day 2, Q4: The principle of 'Zero Tolerance' in vigilance means?", options: { A: "Ignoring small errors", B: "Strict non-acceptance of corruption", C: "Accepting minor gifts", D: "Delayed disciplinary action" } },
    { q: "Day 2, Q5: What is the standard rate of interest charged on delayed payment of customs duty?", options: { A: "6%", B: "12%", C: "15%", D: "18%" } },
    { q: "Day 2, Q6: Which country is India's largest trading partner (based on recent data)?", options: { A: "China", B: "USA", C: "UAE", D: "Germany" } },
    { q: "Day 2, Q7: What does the term 'Ad Valorem' mean in the context of duty calculation?", options: { A: "Based on volume", B: "Based on weight", C: "Based on value", D: "Based on quantity" } },
    { q: "Day 2, Q8: The Code of Conduct for Central Government employees is primarily covered under which rules?", options: { A: "CCS (Leave) Rules", B: "CCS (Conduct) Rules", C: "CCS (Pension) Rules", D: "Fundamental Rules" } },
    { q: "Day 2, Q9: The use of 'Faceless Assessment' in Customs aims to enhance?", options: { A: "Personal contact", B: "Transparency and efficiency", C: "Manual processing", D: "Regional bias" } },
    { q: "Day 2, Q10: What is the primary goal of the World Customs Organization (WCO)?", options: { A: "Setting global prices", B: "Uniformity of Customs procedures", C: "Managing global taxation", D: "Controlling oil supply" } },
  ],
  D3: [
    { q: "Day 3, Q1: What is the statutory time limit for issuing a Show Cause Notice (SCN) in non-fraud cases under the Customs Act?", options: { A: "6 months", B: "1 year", C: "2 years", D: "5 years" } },
    { q: "Day 3, Q2: Which Indian city is the headquarters of the World Trade Organization (WTO)?", options: { A: "Mumbai", B: "Geneva (None in India)", C: "New Delhi", D: "Kolkata" } },
    { q: "Day 3, Q3: What is a 'Bonded Warehouse'?", options: { A: "A prison for smugglers", B: "A place to store goods before duty payment", C: "A type of export processing zone", D: "A government office" } },
    { q: "Day 3, Q4: The 'Preservation of Integrity' falls under the jurisdiction of which body?", options: { A: "Election Commission", B: "Reserve Bank of India", C: "Vigilance and Ethics authorities", D: "Ministry of External Affairs" } },
    { q: "Day 3, Q5: What is the commonly used term for counterfeit or pirated goods?", options: { A: "Gray Market Goods", B: "Infringing Goods", C: "Parallel Imports", D: "OEM Goods" } },
    { q: "Day 3, Q6: Which term represents a deliberate misstatement of facts to evade duty?", options: { A: "Error", B: "Misdeclaration", C: "Clerical mistake", D: "Typo" } },
    { q: "Day 3, Q7: What does the acronym 'ICD' stand for in the logistics sector?", options: { A: "India Cargo Depot", B: "International Customs Division", C: "Inland Container Depot", D: "Integrated Cargo Database" } },
    { q: "Day 3, Q8: The concept of 'Public Interest Disclosure and Protection of Informers Resolution' is commonly known as?", options: { A: "Right to Information Act", B: "Whistleblower Protection", C: "Citizens' Charter", D: "Lokpal Act" } },
    { q: "Day 3, Q9: What is the maximum sentence for certain smuggling offenses under the Customs Act?", options: { A: "1 year", B: "3 years", C: "7 years", D: "10 years" } },
    { q: "Day 3, Q10: What is the primary tool used by Customs to check goods without opening packages?", options: { A: "Magnifying Glass", B: "Weighing Scale", C: "Non-Intrusive Inspection (NII) devices like X-ray scanners", D: "Manual Counting" } },
  ],
  D4: [
    { q: "Day 4, Q1: The concept of 'Due Diligence' primarily relates to?", options: { A: "Fast decision making", B: "Thorough investigation and caution", C: "Following orders blindly", D: "Ignoring minor details" } },
    { q: "Day 4, Q2: Which document confirms the arrival of goods at a port/airport?", options: { A: "Bill of Lading/Airway Bill", B: "Passport", C: "Driving License", D: "Marriage Certificate" } },
    { q: "Day 4, Q3: The 'Star Rating' system for Authorised Economic Operators (AEO) aims to incentivize?", options: { A: "Low duty payment", B: "High-risk traders", C: "Compliance and security", D: "Quick exports only" } },
    { q: "Day 4, Q4: The 'Prevention of Corruption Act' deals with corruption in which sector?", options: { A: "Private Sector", B: "Public Sector", C: "NGO Sector", D: "All sectors equally" } },
    { q: "Day 4, Q5: What is the role of an 'Importer Exporter Code' (IEC)?", options: { A: "To track income tax", B: "Mandatory for import/export business in India", C: "A personal ID card", D: "Vehicle registration" } },
    { q: "Day 4, Q6: What is the penalty for late filing of returns under GST?", options: { A: "Imprisonment", B: "A specific late fee (as per law)", C: "Lifetime ban", D: "Community service" } },
    { q: "Day 4, Q7: Which term means taking goods out of the country?", options: { A: "Import", B: "Transit", C: "Export", D: "Transshipment" } },
    { q: "Day 4, Q8: The 'Integrity Pact' is an agreement between the government and which party?", options: { A: "Foreign governments", B: "Bidders/Contractors for public procurement", C: "Citizens", D: "Media houses" } },
    { q: "Day 4, Q9: What is the primary concern when examining intellectual property rights (IPR) infringement at the border?", options: { A: "Product color", B: "Counterfeit or pirated goods causing harm", C: "Weight of package", D: "Country of origin" } },
    { q: "Day 4, Q10: Which is the most important trait for a Customs official in promoting integrity?", options: { A: "Physical Strength", B: "Knowledge, Fairness, and Honesty", C: "Fast Typing Speed", D: "Loud Voice" } },
  ],
};

// If you publish the sheet as CSV, set this export:
// export const LEADERBOARD_PUBLISHED_CSV ='https://docs.google.com/spreadsheets/d/e/2PACX-1vSmrHbOOPLY3oWdXomNTY9cJPhPxUuR-U9bCrSgah-lvXxYagjM435ZEFo7lpzIZH46phf_q6mjdNoT/pub?gid=1336730465&single=true&output=csv';

// export const LOGO = '/logo/customs.jpg';