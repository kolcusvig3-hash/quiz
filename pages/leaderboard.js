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
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata', // Set explicitly to IST/Kolkata
  }).replace(/,/, '') // Remove comma often added by locale
}

export default function Leaderboard() {
  const [header, setHeader] = useState([])
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
        const res = await fetch(CONFIG.LEADERBOARD_PUBLISHED_CSV, { cache: 'no-store' }) 
        if (!res.ok) throw new Error('Fetch failed: ' + res.status)
        const text = await res.text()
        const parsed = parseCSV(text)
        
        setHeader(parsed.header || [])
        setRows(parsed.rows || [])
      } catch (e) {
        console.error("Leaderboard loading error:", e);
        setError(`Failed to load data: ${e.message}. Check the CSV link.`);
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate the 'Till Date' (yesterday's date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const tillDate = formatDateIST(yesterday)

  return (
    <main className="container">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">
        Scores updated till: <strong>{tillDate} 08:00 PM</strong>.
      </p>

      <div className="leaderboard-card">
        <div className="card-header-blue">
          <h2 className="header-title">Top Scorers</h2>
        </div>
        
        <div className="card-body">
          {error && <div className="error-state">{error}</div>}
          {loading && <div className="loading-state">Loading leaderboard…</div>}
          {rows && rows.length === 0 && !loading && <div className="no-data-state">No data available yet.</div>}

          {rows && rows.length > 0 && (
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  {header.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((cols, i) => (
                  <tr key={i} className={i < 3 ? 'top-3' : undefined}>
                    {cols.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
