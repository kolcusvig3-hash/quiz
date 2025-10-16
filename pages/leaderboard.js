import { useEffect, useState } from 'react'
import { CONFIG } from '../config'

// small CSV parser function (retains the logic from your snippet)
function parseCSV(text) {
  // Split lines, ignoring empty lines and trimming whitespace
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { header: [], rows: [] }
  
  // Split header row by comma, removing surrounding quotes and trimming
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  
  // Split data rows by comma, removing surrounding quotes and trimming
  const rows = lines.slice(1).map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()))
  
  return { header, rows }
}

// Function to format the date to 'DD Mon YYYY' in IST
function formatDateIST(d) {
  // Use toLocaleString for reliable time zone conversion without manual offset calculation
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata', // Set explicitly to IST/Kolkata
  }).replace(/,/, '') // Remove comma often added by locale
}

export default function Leaderboard() {
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!CONFIG.LEADERBOARD_PUBLISHED_CSV) {
        setError('Leaderboard source not configured. Set CONFIG.LEADERBOARD_PUBLISHED_CSV in config.js')
        return
      }
      setLoading(true)
      try {
        // Added cache: 'no-store' to ensure we always get the latest data from the sheet
        const res = await fetch(CONFIG.LEADERBOARD_PUBLISHED_CSV, { cache: 'no-store' }) 
        if (!res.ok) throw new Error('Fetch failed: ' + res.status)
        const text = await res.text()
        const parsed = parseCSV(text)
        
        const header = parsed.header || []
        
        // Find indices for 'score' and 'name' using flexible matching
        const scoreIdx = header.findIndex(h => /score|points|total/i.test(h))
        const nameIdx = header.findIndex(h => /name|full/i.test(h))
        
        // Fallback indices if header names aren't found (using the logic from your snippet)
        const sIdx = scoreIdx >= 0 ? scoreIdx : header.length - 1
        const nIdx = nameIdx >= 0 ? nameIdx : 1

        const cleaned = parsed.rows
          .map(cols => {
            // Clean score: remove non-numeric characters except '.' and '-'
            const sRaw = (cols[sIdx] || '').replace(/[^\d.-]/g, '')
            const score = sRaw === '' ? 0 : Number(sRaw)
            const name = cols[nIdx] || cols[0] || '—' // Fallback to first column
            return { name, score }
          })
          // Filter out invalid scores or zero scores
          .filter(r => !isNaN(r.score) && r.score > 0)
          // Sort descending by score
          .sort((a, b) => b.score - a.score)
          // Add rank after sorting
          .map((r, i) => ({ ...r, rank: i + 1 })) 

        setRows(cleaned)
      } catch (e) {
        console.error("Leaderboard loading error:", e);
        setError(`Failed to load data: ${e.message}. Check the CSV link.`);
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate the 'Till Date' (yesterday's date) - REVERTED TO YESTERDAY'S LOGIC
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tillDate = formatDateIST(yesterday);

  return (
    <main className="container">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">
        Scores updated till: <strong>{tillDate}</strong>.
      </p>

      {/* White box with blue header card (New UI requirement) */}
      <div className="leaderboard-card">
        <div className="card-header-blue">
          <h2 className="header-title">Top Scorers</h2>
        </div>
        
        <div className="card-body">
            {error && <div className="error-state">{error}</div>}
            {loading && <div className="loading-state">Loading leaderboard…</div>}
            {rows && rows.length === 0 && !loading && <div className="no-data-state">No non-zero scores available yet.</div>}

            {rows && rows.length > 0 && (
            <table className="table leaderboard-table">
                <thead>
                <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>NAME</th>
                    <th className="text-right">SCORE</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, i) => (
                    <tr key={i} className={r.rank <= 3 ? 'top-3' : undefined}>
                    <td className="rank-cell">{r.rank}</td>
                    <td className="name-cell">{r.name}</td>
                    <td className="score-cell text-right">{r.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
      </div>
      
      {/* The "Open raw sheet" link/button remains removed. */}
    </main>
  )
}