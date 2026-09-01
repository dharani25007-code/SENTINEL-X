import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import HeaderBar from './components/HeaderBar'
import Dashboard from './pages/Dashboard'
import AnalyzeReport from './pages/AnalyzeReport'
import RiskUniverse from './pages/RiskUniverse'
import SafetyTimeMachine from './pages/SafetyTimeMachine'
import InterventionSimulator from './pages/InterventionSimulator'
import InterventionQueue from './pages/InterventionQueue'
import LifeSavingRules from './pages/LifeSavingRules'
import Auth from './pages/Auth'

function AppContent() {
  const { user } = useAuth()

  // If user is not authenticated, show ONLY the clean standalone Auth page
  if (!user) {
    return (
      <div className="auth-standalone-layout">
        <Auth />
      </div>
    )
  }

  // Once authenticated, show the full HSE Command Center suite
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="content-wrapper">
        <HeaderBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzeReport />} />
            <Route path="/universe" element={<RiskUniverse />} />
            <Route path="/timeline" element={<SafetyTimeMachine />} />
            <Route path="/simulator" element={<InterventionSimulator />} />
            <Route path="/rules" element={<LifeSavingRules />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
