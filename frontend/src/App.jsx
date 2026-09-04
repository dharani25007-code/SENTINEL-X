import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import HeaderBar from './components/HeaderBar'
import Dashboard from './pages/Dashboard'
import AnalyzeReport from './pages/AnalyzeReport'
import RiskUniverse from './pages/RiskUniverse'
import SafetyTimeMachine from './pages/SafetyTimeMachine'
import InterventionSimulator from './pages/InterventionSimulator'
import LifeSavingRules from './pages/LifeSavingRules'

function AppContent() {
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
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
