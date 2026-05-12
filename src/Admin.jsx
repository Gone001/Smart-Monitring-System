import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Admin() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminToken') !== null
  })
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [devices, setDevices] = useState([])
  const [events, setEvents] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [activeTab, setActiveTab] = useState('devices')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Invalid password')
      }
      const data = await res.json()
      sessionStorage.setItem('adminToken', data.token)
      setIsAuthenticated(true)
      setLoginError('')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    setPassword('')
  }

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Token': sessionStorage.getItem('adminToken') || ''
  })

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/devices`)
      if (!res.ok) throw new Error('Failed to fetch devices')
      const data = await res.json()
      setDevices(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics error:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDevices()
      fetchAnalytics()
    }
  }, [isAuthenticated, fetchDevices, fetchAnalytics])

  const fetchDeviceEvents = async (deviceId) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/devices/${deviceId}/events?limit=100`)
      if (!res.ok) throw new Error('Failed to fetch device events')
      const data = await res.json()
      setEvents(data)
      setSelectedDevice(deviceId)
      setActiveTab('events')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/history?limit=100`)
      if (!res.ok) throw new Error('Failed to fetch all events')
      const data = await res.json()
      setEvents(data)
      setSelectedDevice(null)
      setActiveTab('events')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activateDevice = async (deviceId) => {
    try {
      const res = await fetch(`${API_URL}/api/devices/${deviceId}/activate`, {
        method: 'PUT'
      })
      if (!res.ok) throw new Error('Failed to activate device')
      fetchDevices()
    } catch (err) {
      setError(err.message)
    }
  }

  const deactivateDevice = async (deviceId) => {
    try {
      const res = await fetch(`${API_URL}/api/devices/${deviceId}/deactivate`, {
        method: 'PUT'
      })
      if (!res.ok) throw new Error('Failed to deactivate device')
      fetchDevices()
    } catch (err) {
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
      case 'inactive': return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    } catch {
      return timestamp
    }
  }

  const getDeviceIdentifier = (event) => {
    return event.device_id || event.source || 'manual'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-2xl font-black mb-4">
                IoT
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-slate-400 mt-2">Enter password to access admin panel</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 transition"
                  autoFocus
                />
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm text-center"
                >
                  {loginError}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-bold hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full py-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-slate-400 mt-2">Manage devices and monitor events</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl border border-red-400/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Logout
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 backdrop-blur-xl"
          >
            {error}
          </motion.div>
        )}

        {analytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Current Inside', value: analytics.currentInside, color: 'from-cyan-500 to-blue-500' },
              { label: 'Total Entries', value: analytics.totalEntries, color: 'from-emerald-500 to-green-400' },
              { label: 'Total Exits', value: analytics.totalExits, color: 'from-rose-500 to-pink-500' },
              { label: 'Room Capacity', value: analytics.roomCapacity, color: 'from-violet-500 to-fuchsia-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${stat.color} text-white`}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-black">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {['devices', 'events'].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'events' && !selectedDevice) fetchAllEvents()
              }}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
          {activeTab === 'events' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAllEvents}
              className="px-5 py-2.5 rounded-xl font-medium bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all duration-300 ml-auto"
            >
              View All Events
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'devices' && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Registered Devices
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
                </div>
              ) : devices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <p className="text-slate-400">No devices registered yet</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => fetchDeviceEvents(device.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                        selectedDevice === device.id
                          ? 'bg-violet-500/20 border-violet-400/30'
                          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold">
                            {device.name ? device.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div>
                            <h3 className="font-bold">{device.name || `Device ${device.id.slice(0, 8)}`}</h3>
                            <p className="text-xs text-slate-400">ID: {device.id.slice(0, 12)}...</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        {device.status !== 'active' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              activateDevice(device.id)
                            }}
                            className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition border border-emerald-400/30"
                          >
                            Activate
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              deactivateDevice(device.id)
                            }}
                            className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm font-bold hover:bg-red-500/30 transition border border-red-400/30"
                          >
                            Deactivate
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            fetchDeviceEvents(device.id)
                          }}
                          className="flex-1 py-2 rounded-xl bg-violet-500/20 text-violet-300 text-sm font-bold hover:bg-violet-500/30 transition border border-violet-400/30"
                        >
                          View Events
                        </motion.button>
                      </div>
                      
                      {device.last_seen && (
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                          Last seen: {formatTimestamp(device.last_seen)}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {selectedDevice ? `Events - ${selectedDevice}` : 'All Events'}
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              ) : events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <p className="text-slate-400">No events found</p>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ x: 5, scale: 1.01 }}
                      className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                            event.type === 'entry' 
                              ? 'bg-emerald-500/20 border border-emerald-400/30' 
                              : 'bg-red-500/20 border border-red-400/30'
                          }`}>
                            {event.type === 'entry' ? '\u2197' : '\u2199'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                event.type === 'entry' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                                  : 'bg-red-500/20 text-red-300 border border-red-400/30'
                              }`}>
                                {event.type?.toUpperCase() || 'UNKNOWN'}
                              </span>
                              <span className="text-sm text-slate-400">via {getDeviceIdentifier(event)}</span>
                            </div>
                            {event.device_id && (
                              <p className="text-xs text-slate-500 mt-1">Device ID: {event.device_id}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-300">
                            {formatTimestamp(event.timestamp)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            ID: {event.id}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
