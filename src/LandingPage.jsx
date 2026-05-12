import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SpotlightCard from './SpotlightCard'

const LandingPage = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(true)

  const features = [
    {
      icon: '📡',
      title: 'IoT Sensor Integration',
      description: 'Connect Arduino, ESP32, or IR sensors for automatic people counting in real-time.'
    },
    {
      icon: '📊',
      title: 'Live Analytics',
      description: 'Track entries, exits, and current occupancy with instant dashboard updates.'
    },
    {
      icon: '🔒',
      title: 'Admin Control',
      description: 'Manage multiple devices, view history, and control from a single panel.'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works seamlessly on desktop, tablet, and mobile devices.'
    }
  ]

  const steps = [
    { step: '01', title: 'Setup Sensors', desc: 'Connect IR sensors to ESP32/Arduino' },
    { step: '02', title: 'Configure', desc: 'Set room capacity in dashboard' },
    { step: '03', title: 'Ready', desc: 'Start tracking automatically' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#04010b] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <ThreeDBackground darkMode={darkMode} />

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className={`grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl text-sm sm:text-base font-black shadow-xl ${darkMode ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-yellow-400' : 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-yellow-500'}`}>
            IoT
          </div>
          <span className="text-lg sm:text-xl font-bold">Smart Counter</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${darkMode ? 'bg-violet-500/20 border border-violet-400/30 text-violet-200 hover:bg-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >
            Get Started →
          </button>
        </motion.div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-4 ${darkMode ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'bg-fuchsia-100 text-fuchsia-700'}`}
          >
            IoT Student Counter
          </motion.span>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Smart Room
            <br />
            Occupancy
            <br />
            <span className={darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400' : 'text-violet-600'}>
              Tracking System
            </span>
          </h1>

          <p className={`mx-auto mt-6 max-w-2xl text-sm sm:text-base ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            Track room occupancy with IoT sensors. Perfect for classrooms, libraries, and study halls.
            Get real-time analytics and manage multiple rooms from one dashboard.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-sm font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl"
            >
              Launch Dashboard
            </button>
            <button
              className={`px-6 py-3 rounded-2xl border text-sm font-bold transition hover:scale-105 ${darkMode ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
            >
              View Demo
            </button>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 sm:mt-24"
        >
          <h2 className="mb-8 text-center text-2xl sm:text-3xl font-bold">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <SpotlightCard
                key={index}
                className={`rounded-2xl p-5 ${darkMode ? 'bg-white/[0.04] border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <h3 className="mt-3 text-base font-bold">{feature.title}</h3>
                  <p className={`mt-2 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {feature.description}
                  </p>
                </motion.div>
              </SpotlightCard>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-16 sm:mt-24"
        >
          <h2 className="mb-8 text-center text-2xl sm:text-3xl font-bold">
            How It Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${darkMode ? 'bg-violet-500/20 text-violet-200' : 'bg-violet-100 text-violet-600'}`}>
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 sm:mt-24 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">
            Why Use Smart Counter?
          </h2>
          <div className="mx-auto mt-6 max-w-3xl grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
              className={`rounded-2xl p-4 text-left ${darkMode ? 'bg-emerald-500/10 border border-emerald-400/20' : 'bg-emerald-50 border border-emerald-200'}`}
            >
              <h3 className="font-bold">✓ Optimize Space Usage</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Know instantly when a room is full or available.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              className={`rounded-2xl p-4 text-left ${darkMode ? 'bg-cyan-500/10 border border-cyan-400/20' : 'bg-cyan-50 border border-cyan-200'}`}
            >
              <h3 className="font-bold">✓ Safety Compliance</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Maintain room capacity limits automatically.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
              className={`rounded-2xl p-4 text-left ${darkMode ? 'bg-violet-500/10 border border-violet-400/20' : 'bg-violet-50 border border-violet-200'}`}
            >
              <h3 className="font-bold">✓ Data-Driven Decisions</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Analyze occupancy patterns over time.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
              className={`rounded-2xl p-4 text-left ${darkMode ? 'bg-yellow-500/10 border border-yellow-400/20' : 'bg-yellow-50 border border-yellow-200'}`}
            >
              <h3 className="font-bold">✓ Easy Integration</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Works with existing infrastructure.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <footer className={`mt-16 sm:mt-24 border-t py-8 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${darkMode ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-yellow-400' : 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-yellow-500 text-white'}`}>
                IoT
              </div>
              <span className="text-sm font-medium">Smart Counter</span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Built for educational institutions
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

function ThreeDBackground({ darkMode }) {
  if (!darkMode) return null

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl animate-pulse" />
      <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_18%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.12),transparent_18%)]" />

      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:42px_42px]" />
    </div>
  )
}

export default LandingPage