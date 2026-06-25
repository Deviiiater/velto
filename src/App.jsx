import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...')
  const [systemStatus, setSystemStatus] = useState('NOMINAL') // NOMINAL, DIAGNOSTIC, HALTED
  const [autopilot, setAutopilot] = useState(true)
  const [robots, setRobots] = useState([
    { id: 'ROBO-01', name: 'Alpha Scout', battery: 94, status: 'Patrolling', speed: 4.2, temp: 36.2 },
    { id: 'ROBO-02', name: 'Beta Hauler', battery: 78, status: 'Navigating', speed: 2.8, temp: 41.5 },
    { id: 'ROBO-03', name: 'Gamma Sentry', battery: 42, status: 'Docked / Charging', speed: 0.0, temp: 29.8 }
  ])
  const [logs, setLogs] = useState([
    { time: '10:42:01', msg: 'System uplink established successfully.', type: 'success' },
    { time: '10:42:05', msg: 'Initializing secure quantum channel...', type: 'info' },
    { time: '10:42:10', msg: 'Real-time telemetry stream synchronized.', type: 'success' }
  ])

  const terminalEndRef = useRef(null)

  // Fetch Supabase connection state
  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('_placeholder').select('*').limit(1)
        if (error && error.code !== '42P01') {
          console.error(error)
          setDbStatus('Connection Error')
        } else {
          setDbStatus('Supabase Connected')
        }
      } catch (err) {
        setDbStatus('Supabase Disconnected')
      }
    }
    checkConnection()
  }, [])

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Live telemetry simulation
  useEffect(() => {
    if (systemStatus === 'HALTED') return

    const interval = setInterval(() => {
      // 1. Update battery & telemetry randomly
      setRobots(prev => prev.map(r => {
        if (r.status === 'Docked / Charging') {
          const nextBat = Math.min(100, r.battery + 1)
          return {
            ...r,
            battery: nextBat,
            status: nextBat === 100 ? 'Patrolling' : 'Docked / Charging',
            speed: nextBat === 100 ? 3.5 : 0.0,
            temp: Math.max(25, r.temp - 0.2)
          }
        }

        const nextBat = Math.max(0, r.battery - (autopilot ? 0.2 : 0.1))
        const batDepleted = nextBat <= 0
        return {
          ...r,
          battery: parseFloat(nextBat.toFixed(1)),
          status: batDepleted ? 'Docked / Charging' : r.status,
          speed: batDepleted ? 0 : r.speed + (Math.random() - 0.5) * 0.4,
          temp: Math.min(65, r.temp + (Math.random() - 0.5) * 0.8)
        }
      }))

      // 2. Generate random live event log entries
      const events = [
        { msg: 'Sensor metrics update broadcast complete.', type: 'info' },
        { msg: 'Alpha Scout detected minor obstacle. Recalculating path...', type: 'warning' },
        { msg: 'Beta Hauler cargo weight balanced.', type: 'success' },
        { msg: 'Autopilot stabilization telemetry sweep ok.', type: 'info' },
        { msg: 'Quantum encryption key rotated.', type: 'success' }
      ]

      const randomEvent = events[Math.floor(Math.random() * events.length)]
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]

      setLogs(prev => [
        ...prev,
        { time: timeStr, msg: randomEvent.msg, type: randomEvent.type }
      ].slice(-25)) // Keep last 25 logs

    }, 3500)

    return () => clearInterval(interval)
  }, [systemStatus, autopilot])

  // Diagnostic scan trigger
  const runDiagnostic = () => {
    setSystemStatus('DIAGNOSTIC')
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]

    setLogs(prev => [
      ...prev,
      { time: timeStr, msg: '⚠️ Diagnostic sweep initialized. Scanning system components...', type: 'warning' }
    ])

    setTimeout(() => {
      setSystemStatus('NOMINAL')
      const finishTime = new Date().toTimeString().split(' ')[0]
      setLogs(prev => [
        ...prev,
        { time: finishTime, msg: '✓ Diagnostic sweep completed. 0 faults found.', type: 'success' }
      ])
    }, 2000)
  }

  // Emergency halt trigger
  const triggerHalt = () => {
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]

    if (systemStatus === 'HALTED') {
      // Resume system
      setSystemStatus('NOMINAL')
      setRobots([
        { id: 'ROBO-01', name: 'Alpha Scout', battery: 94, status: 'Patrolling', speed: 4.2, temp: 36.2 },
        { id: 'ROBO-02', name: 'Beta Hauler', battery: 78, status: 'Navigating', speed: 2.8, temp: 41.5 },
        { id: 'ROBO-03', name: 'Gamma Sentry', battery: 42, status: 'Docked / Charging', speed: 0.0, temp: 29.8 }
      ])
      setLogs(prev => [
        ...prev,
        { time: timeStr, msg: '🚀 System resumed. Drones re-engaging task queues.', type: 'success' }
      ])
    } else {
      // Stop system
      setSystemStatus('HALTED')
      setRobots(prev => prev.map(r => ({ ...r, speed: 0.0, status: 'HALTED' })))
      setLogs(prev => [
        ...prev,
        { time: timeStr, msg: '🛑 EMERGENCY HALT TRIGGERED. ALL FLEET VEHICLES STOPPED.', type: 'warning' }
      ])
    }
  }

  return (
    <div className="app-layout">
      {/* ─── CYBER HEADER NAVBAR ─── */}
      <header className="cyber-header">
        <div className="header-container">
          <div className="logo-group">
            <span className="logo-icon">🪐</span>
            <span className="logo-text">E-ROBO CORE</span>
          </div>

          <div className="status-badge">
            <div className={`pulse ${dbStatus.includes('Error') || dbStatus.includes('Disconnected') ? 'error' : ''}`}></div>
            {dbStatus.toUpperCase()}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT BODY ─── */}
      <div className="app-container">

        {/* Hero title & main controls */}
        <section className="dashboard-hero">
          <h1 className="hero-title">ROBOTICS COMMAND CENTER</h1>
          <p className="hero-subtitle">
            Enterprise fleet monitoring, real-time quantum telemetry uplink, and automated AI autopilot stabilization panels.
          </p>

          <div className="action-row">
            <button
              onClick={runDiagnostic}
              disabled={systemStatus === 'DIAGNOSTIC' || systemStatus === 'HALTED'}
              className="btn-primary"
            >
              <span>⚡</span> {systemStatus === 'DIAGNOSTIC' ? 'Scanning...' : 'Diagnostic Sweep'}
            </button>

            <button
              onClick={() => {
                setAutopilot(!autopilot)
                const now = new Date().toTimeString().split(' ')[0]
                setLogs(prev => [
                  ...prev,
                  { time: now, msg: autopilot ? 'Autopilot deactivated. Manual override armed.' : 'Autopilot engaged. Neural network pathfinding online.', type: 'info' }
                ])
              }}
              disabled={systemStatus === 'HALTED'}
              className="btn-secondary"
            >
              Autopilot: {autopilot ? 'ENGAGED' : 'MANUAL'}
            </button>

            <button
              onClick={triggerHalt}
              className={`btn-danger ${systemStatus === 'HALTED' ? 'bg-[#00ffaa]' : ''}`}
              style={systemStatus === 'HALTED' ? { background: 'linear-gradient(135deg, #00ffaa, #00bb77)', color: '#030308', boxShadow: '0 0 20px rgba(0,255,170,0.3)' } : {}}
            >
              {systemStatus === 'HALTED' ? 'Resume Fleet' : 'Emergency Halt'}
            </button>
          </div>
        </section>

        {/* Telemetry Grid: Console + Active Drones */}
        <div className="telemetry-dashboard">

          {/* Active Fleet Monitoring cards */}
          <div className="features-grid" style={{ marginTop: 0 }}>
            {robots.map((robot) => (
              <div key={robot.id} className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>{robot.id}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: robot.status === 'HALTED' ? 'var(--accent)' : robot.status.includes('Charging') ? 'var(--secondary)' : '#00ffaa',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.03)'
                  }}>
                    {robot.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff', textAlign: 'left' }}>{robot.name}</h3>

                <div className="metric-row">
                  <span className="metric-label">Battery Level</span>
                  <span className="metric-value" style={{ color: robot.battery < 30 ? 'var(--accent)' : robot.battery < 60 ? 'orange' : '#00ffaa' }}>
                    {robot.battery}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${robot.battery}%`,
                      background: robot.battery < 30 ? 'var(--accent)' : 'linear-gradient(90deg, var(--primary), var(--secondary))'
                    }}
                  ></div>
                </div>

                <div className="metric-row" style={{ marginTop: '0.5rem' }}>
                  <span className="metric-label">Velocity</span>
                  <span className="metric-value">{robot.speed.toFixed(1)} m/s</span>
                </div>

                <div className="metric-row">
                  <span className="metric-label">Core Temp</span>
                  <span className="metric-value" style={{ color: robot.temp > 50 ? 'var(--accent)' : 'var(--text-main)' }}>
                    {robot.temp.toFixed(1)} °C
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Terminal Console log section */}
          <div className="glass-panel terminal-panel">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(0, 243, 255, 0.6)', letterSpacing: '1.5px', fontWeight: 800 }}>
                QUANTUM_LOG_STREAM
              </span>
            </div>

            <div className="terminal-logs">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  <span className={`log-msg ${log.type || ''}`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default App
