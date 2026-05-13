import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Admin from './Admin'
import LandingPage from './LandingPage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Dashboard() {
  const roomCapacity = 80

  const [entered, setEntered] = useState(0)
  const [exited, setExited] = useState(0)
  const [error, setError] = useState(null)
  const [pulse, setPulse] = useState(false)
  const [systemHealth, setSystemHealth] = useState({
    ir_beam: 'Standby',
    wifi_sync: 'Checking...',
    backend: 'Checking...'
  })
  const navigate = useNavigate()

  const inside = Math.max(entered - exited, 0)
  const occupancy = Math.min((inside / roomCapacity) * 100, 100)

  useEffect(() => {
    fetchState()
    fetchHealth()
    const healthInterval = setInterval(fetchHealth, 15000)

    const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setSystemHealth(prev => ({ ...prev, backend: 'Connected' }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'state_update') {
          setEntered(msg.data.entered)
          setExited(msg.data.exited)
          setError(null)
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }

    ws.onerror = () => {
      setSystemHealth(prev => ({ ...prev, backend: 'Disconnected' }))
    }

    ws.onclose = () => {
      setSystemHealth(prev => ({ ...prev, backend: 'Disconnected' }))
    }

    return () => {
      clearInterval(healthInterval)
      ws.close()
    }
  }, [])

  useEffect(() => {
    setPulse(true)
    const timer = setTimeout(() => setPulse(false), 450)
    return () => clearTimeout(timer)
  }, [entered, exited])

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/api/state`)
      if (!res.ok) throw new Error('Failed to fetch state')
      const data = await res.json()
      setEntered(data.entered)
      setExited(data.exited)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/system/health`)
      if (res.ok) {
        const data = await res.json()
        setSystemHealth(data)
      }
    } catch {
      setSystemHealth(prev => ({
        ir_beam: prev.ir_beam,
        wifi_sync: 'Offline',
        backend: 'Offline'
      }))
    }
  }

  const handleEntry = async () => {
    try {
      const res = await fetch(`${API_URL}/api/entry`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to record entry')
      const data = await res.json()
      setEntered(data.entered)
      setExited(data.exited)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleExit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/exit`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to record exit')
      const data = await res.json()
      setEntered(data.entered)
      setExited(data.exited)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReset = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reset`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to reset')
      const data = await res.json()
      setEntered(data.entered)
      setExited(data.exited)
    } catch (err) {
      setError(err.message)
    }
  }

  const statusText =
    occupancy >= 90 ? 'Full' : occupancy >= 60 ? 'Busy' : occupancy > 0 ? 'Stable' : 'Idle'

  const statusColor =
    occupancy >= 90
      ? 'bg-red-500/20 text-red-200 border-red-400/20'
      : occupancy >= 60
      ? 'bg-yellow-400/20 text-yellow-200 border-yellow-300/20'
      : occupancy > 0
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/20'
      : 'bg-slate-500/20 text-slate-200 border-slate-400/20'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04010b] text-white">
      <ThreeDBackground />

      <div className="relative z-10 flex min-h-screen">
        <VerticalFooter />

        <main className="w-full">
          <div className="mx-auto grid min-h-screen max-w-[1600px] items-center gap-8 px-4 py-6 sm:px-6 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:px-10 lg:py-10 xl:px-14">
            <section className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-1.5 text-xs font-medium text-fuchsia-200 shadow-lg shadow-fuchsia-900/20 backdrop-blur-md">
                  Live Occupancy Monitoring
                </span>
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-violet-200 hover:bg-white/10 transition duration-300"
                >
                  Admin Panel
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem]">
                IoT dashboard
                <br />
                for room entry
                <br />
                and exit
                <br />
                counting
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                This page is designed for a smart room counter where Arduino, ESP32, and IR
                sensors can be connected to monitor how many people entered, exited, and are
                currently inside the room.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <ActionButton
                  onClick={handleEntry}
                  text="Entry ++"
                  className="from-emerald-500 to-lime-400 shadow-emerald-500/30 hover:shadow-emerald-400/40"
                />
                <ActionButton
                  onClick={handleExit}
                  text="Exit --"
                  className="from-red-500 to-orange-400 shadow-red-500/30 hover:shadow-red-400/40"
                />
                <button
                  onClick={handleReset}
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/10 active:scale-95 sm:px-7 sm:text-base"
                >
                  Reset Counter
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  title="Total Entered"
                  value={entered}
                  text="People who came inside"
                  color="from-violet-500 to-fuchsia-500"
                  pulse={pulse}
                />
                <MetricCard
                  title="Total Exited"
                  value={exited}
                  text="People who left the room"
                  color="from-rose-500 to-pink-500"
                  pulse={pulse}
                />
                <MetricCard
                  title="Currently Inside"
                  value={inside}
                  text="Live room occupancy"
                  color="from-cyan-500 to-blue-500"
                  pulse={pulse}
                />
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white/[0.06] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-violet-200">
                      System Snapshot
                    </p>
                    <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                      Smart Count Overview
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/80" />
                    Live Data
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="order-1 lg:order-2">
              <div className="[perspective:2000px]">
                <div className="group relative rounded-[34px] border border-white/10 bg-white/[0.05] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(4deg)_rotateY(-6deg)_translateY(-8px)]">
                  <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-violet-500/10 via-transparent to-red-500/10 opacity-70 blur-2xl" />

                  <div className="relative overflow-hidden rounded-[28px] border border-white/10">
                    <div
                      className="h-[240px] w-full bg-gradient-to-br from-violet-900/50 via-fuchsia-800/30 to-cyan-900/50 transition duration-700 group-hover:scale-110 sm:h-[300px] md:h-[340px] lg:h-[360px]"
                      role="img"
                      aria-label="Conference room visualization"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl mb-2 opacity-40">🏢</div>
                          <p className="text-sm text-white/40 font-medium">Conference Room A</p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#10051f] via-[#170a2d]/30 to-transparent" />

                    <div className="absolute left-4 top-4 flex gap-2 [transform:translateZ(30px)]">
                      <span className="h-3 w-3 rounded-full bg-red-400 shadow-lg shadow-red-400/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/80" />
                      <span className="h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/80" />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 rounded-[28px] border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur-xl transition duration-500 [transform:translateZ(45px)] group-hover:bg-black/40 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-200 sm:text-xs">
                            Room Status
                          </p>
                          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl md:text-4xl">
                            Conference Room A
                          </h2>
                        </div>

                        <div
                          className={`rounded-full border px-4 py-2 text-xs font-bold shadow-lg transition duration-300 hover:scale-105 sm:text-sm ${statusColor}`}
                        >
                          {statusText}
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-200 sm:text-sm">
                          <span>Occupancy Load</span>
                          <span>{occupancy.toFixed(0)}%</span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white/10 shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-red-400 to-yellow-300 transition-all duration-500"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MiniPanel
                      label="IR Beam"
                      value={systemHealth.ir_beam}
                      active={systemHealth.ir_beam === 'Active'}
                    />
                    <MiniPanel
                      label="WiFi Sync"
                      value={systemHealth.wifi_sync}
                      active={systemHealth.wifi_sync !== 'Poor' && systemHealth.wifi_sync !== 'Offline'}
                    />
                    <MiniPanel
                      label="Backend"
                      value={systemHealth.backend}
                      active={systemHealth.backend === 'Connected'}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <MobileFooter />
        </main>
      </div>
    </div>
  )
}

function ThreeDBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl animate-pulse sm:h-80 sm:w-80" />
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.10),transparent_18%),radial-gradient(circle_at_20%_80%,rgba(250,204,21,0.10),transparent_18%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12),transparent_18%)]" />

      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="absolute left-[8%] top-[16%] h-28 w-28 rounded-3xl border border-violet-400/20 bg-violet-500/10 blur-sm [transform:rotate(24deg)] sm:h-36 sm:w-36" />
      <div className="absolute right-[12%] top-[58%] h-24 w-24 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-sm" />
      <div className="absolute bottom-[10%] left-[42%] h-20 w-20 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 blur-sm [transform:rotate(18deg)]" />
    </div>
  )
}

function VerticalFooter() {
  return (
    <aside className="hidden min-h-screen w-[92px] flex-col items-center justify-between border-r border-white/10 bg-black/20 px-3 py-6 backdrop-blur-xl lg:flex">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-yellow-400 text-lg font-black shadow-xl shadow-fuchsia-500/30 transition duration-300 hover:scale-110 hover:rotate-6">
          IoT
        </div>

        <div className="h-20 w-px bg-gradient-to-b from-violet-400/0 via-violet-400/60 to-violet-400/0" />

        <p className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold uppercase tracking-[0.38em] text-slate-300">
          Smart Room Counter
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <FooterDot color="bg-violet-400" />
        <FooterDot color="bg-cyan-400" />
        <FooterDot color="bg-yellow-300" />
        <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.34em] text-slate-400">
          Responsive 3D UI
        </p>
      </div>
    </aside>
  )
}

function MobileFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20 px-4 py-5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-yellow-400 text-sm font-black shadow-lg shadow-fuchsia-500/30">
            IoT
          </div>
          <div>
            <p className="text-sm font-bold">Smart Room Counter</p>
            <p className="text-xs text-slate-400">Responsive 3D dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            IR Active
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            WiFi Good
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterDot({ color }) {
  return <span className={`h-3 w-3 rounded-full ${color} shadow-lg`} />
}

function ActionButton({ text, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-r px-6 py-3 text-sm font-bold text-white shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 sm:px-7 sm:text-base ${className}`}
    >
      {text}
    </button>
  )
}

function MetricCard({ title, value, text, color, pulse }) {
  return (
    <div className="[perspective:1200px]">
      <div
        className={`group rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-500 [transform-style:preserve-3d] hover:[transform:rotateX(6deg)_rotateY(-8deg)_translateY(-8px)] ${
          pulse ? 'ring-1 ring-white/10' : ''
        }`}
      >
        <div
          className={`inline-flex rounded-2xl bg-gradient-to-r ${color} px-4 py-2 text-sm font-bold shadow-lg [transform:translateZ(32px)]`}
        >
          {title}
        </div>

        <h3 className="mt-5 text-4xl font-extrabold transition duration-300 group-hover:scale-105 sm:text-5xl [transform:translateZ(40px)]">
          {value}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-300 [transform:translateZ(24px)]">
          {text}
        </p>

        <div
          className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${color} shadow-lg transition duration-500 group-hover:h-2.5 [transform:translateZ(18px)]`}
        />
      </div>
    </div>
  )
}

function MiniPanel({ label, value, active }) {
  const baseClasses = 'rounded-2xl p-4 shadow-xl backdrop-blur-lg transition duration-300 [transform-style:preserve-3d] hover:[transform:rotateX(5deg)_rotateY(-8deg)_translateY(-4px)]'
  const activeClasses = 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200'
  const standbyClasses = 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300'
  const warningClasses = 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200'
  const errorClasses = 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-200'

  let statusClasses = standbyClasses
  if (active) {
    statusClasses = activeClasses
  } else if (value === 'Poor' || value === 'Offline' || value === 'Disconnected') {
    statusClasses = errorClasses
  } else if (value === 'Standby' || value === 'Checking...') {
    statusClasses = standbyClasses
  }

  return (
    <div className="[perspective:1000px]">
      <div className={`${baseClasses} ${statusClasses}`}>
        <p className="text-xs [transform:translateZ(20px)]">{label}</p>
        <p className="mt-2 text-2xl font-bold [transform:translateZ(34px)]">{value}</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}