import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext'
import { Shield, KeyRound, UserCheck, Building2, User, CheckCircle2, ArrowRight, Zap, Lock, AlertCircle, Sparkles } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // Login form state
  const [selectedPersona, setSelectedPersona] = useState(DEMO_PERSONAS[0])
  const [loginBadge, setLoginBadge] = useState(DEMO_PERSONAS[0].badge)
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const passInputRef = useRef(null)

  // Register form state
  const [fullName, setFullName] = useState('')
  const [badgeId, setBadgeId] = useState('')
  const [facility, setFacility] = useState('Duliajan Central Complex')
  const [role, setRole] = useState('Site Safety Engineer')
  const [passkey, setPasskey] = useState('')
  const [registeredSuccess, setRegisteredSuccess] = useState(false)

  const handleSelectPersona = (persona) => {
    setSelectedPersona(persona)
    setLoginBadge(persona.badge)
    setLoginPass('')
    setLoginError('')
    // Focus on password input
    setTimeout(() => {
      passInputRef.current?.focus()
    }, 100)
  }

  const handleAutoFillPass = () => {
    if (selectedPersona) {
      setLoginPass(selectedPersona.passwords[0])
      setLoginError('')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    if (!loginBadge.trim()) {
      setLoginError('Please select or enter an OIL Badge ID.')
      return
    }

    if (!loginPass.trim()) {
      setLoginError('Security clearance passkey is required to access the platform.')
      passInputRef.current?.focus()
      return
    }

    setIsAuthenticating(true)

    setTimeout(() => {
      const result = login(loginBadge, loginPass)
      setIsAuthenticating(false)

      if (result.success) {
        setLoginSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 700)
      } else {
        setLoginError(result.message || 'Authentication failed. Please verify credentials.')
      }
    }, 400)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    if (!fullName.trim() || !badgeId.trim()) return
    register({ fullName, badgeId, facility, role, passkey })
    setRegisteredSuccess(true)
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <div className="auth-page-container">
      {/* Background glowing telemetry */}
      <div className="auth-glow-top"></div>
      <div className="auth-glow-bottom"></div>

      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="oil-badge">
            <span className="oil-tag">OIL INDIA LIMITED</span>
            <span className="sih-tag">SIH26165</span>
          </div>
          <h2>🛡️ SENTINEL-<span>X</span></h2>
          <p className="auth-subtitle">Autonomous Safety Precursor Intelligence & Interception Platform</p>
          <div className="auth-status-pill">
            <span className="status-dot"></span>
            <span>RESTRICTED ACCESS • ENTERPRISE HSE SECURITY</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setLoginError(''); }}
          >
            <KeyRound size={16} />
            <span>Personnel Sign In</span>
          </button>
          <button 
            type="button" 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setLoginError(''); }}
          >
            <UserCheck size={16} />
            <span>Personnel Onboarding</span>
          </button>
        </div>

        {/* TAB 1: LOGIN FLOW */}
        {mode === 'login' && (
          <>
            {/* Step 1: Select Verified Personnel Identity */}
            <div className="quick-personas-section">
              <div className="quick-personas-title">
                <Shield size={14} color="var(--cyan-ai)" />
                <span>STEP 1: SELECT VERIFIED PERSONNEL ID:</span>
              </div>
              <div className="personas-grid">
                {DEMO_PERSONAS.map(p => {
                  const isSelected = selectedPersona?.id === p.id || loginBadge.toUpperCase() === p.badge.toUpperCase()
                  return (
                    <button 
                      key={p.id}
                      type="button"
                      className={`persona-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectPersona(p)}
                    >
                      <div className="persona-avatar">{p.avatar}</div>
                      <div className="persona-info">
                        <span className="persona-name">{p.name}</span>
                        <span className="persona-role">{p.role}</span>
                        <span className="persona-facility">{p.facility} • <strong>{p.badge}</strong></span>
                      </div>
                      {isSelected && (
                        <div className="persona-selected-indicator">
                          <CheckCircle2 size={16} color="var(--cyan-ai)" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message Box */}
            {loginError && (
              <div className="auth-error-box">
                <AlertCircle size={16} className="error-icon" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Step 2: Enter Password Form */}
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>OIL Employee / Badge ID</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="e.g. OIL-DIR-101" 
                    value={loginBadge} 
                    onChange={(e) => {
                      setLoginBadge(e.target.value)
                      const matched = DEMO_PERSONAS.find(p => p.badge.toLowerCase() === e.target.value.toLowerCase())
                      if (matched) setSelectedPersona(matched)
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Security Clearance Passkey</label>
                  {selectedPersona && (
                    <button 
                      type="button" 
                      className="autofill-pass-btn"
                      onClick={handleAutoFillPass}
                      title="Quick fill for presentation"
                    >
                      <Sparkles size={11} /> Auto-Fill Demo Passkey
                    </button>
                  )}
                </div>
                <div className="input-icon-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input 
                    ref={passInputRef}
                    type="password" 
                    placeholder={selectedPersona ? `Enter passkey for ${selectedPersona.name}` : 'Enter your clearance key'} 
                    value={loginPass} 
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                  />
                </div>
                {selectedPersona && (
                  <span className="input-hint">
                    🔒 Authorized key hint for demo: <code>{selectedPersona.defaultHint}</code>
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className={`auth-submit-btn ${loginSuccess ? 'success' : ''}`}
                disabled={isAuthenticating}
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>SECURITY CLEARANCE VERIFIED • ACCESS GRANTED</span>
                  </>
                ) : isAuthenticating ? (
                  <span>AUTHENTICATING WITH OIL SECURITY GRID...</span>
                ) : (
                  <>
                    <span>VERIFY CREDENTIALS & ENTER COMMAND CENTER</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* TAB 2: REGISTER FORM */}
        {mode === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            {registeredSuccess ? (
              <div className="register-success-box">
                <CheckCircle2 size={36} color="var(--emerald-safe)" />
                <h4>Personnel Provisioned Successfully!</h4>
                <p>Establishing facility permissions and routing to Command Center...</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-icon-wrapper">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="e.g. Debajit Saikia" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>OIL Employee / Contractor Badge ID</label>
                    <div className="input-icon-wrapper">
                      <Shield size={16} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="e.g. OIL-HSE-7719" 
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned Operational Facility</label>
                    <div className="input-icon-wrapper">
                      <Building2 size={16} className="input-icon" />
                      <select value={facility} onChange={(e) => setFacility(e.target.value)}>
                        <option value="Duliajan Central Complex">Duliajan Central Complex</option>
                        <option value="Digboi Refinery Unit #2">Digboi Refinery Unit #2</option>
                        <option value="Moran Drilling Rig #4">Moran Drilling Rig #4</option>
                        <option value="Naharkatiya Gas Plant">Naharkatiya Gas Plant</option>
                        <option value="Pipeline Pump Station 7">Pipeline Pump Station 7</option>
                        <option value="Numaligarh Terminal">Numaligarh Terminal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Designation / Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="Site Safety Engineer">Site Safety Engineer</option>
                      <option value="Field Operations Inspector">Field Operations Inspector</option>
                      <option value="HSE Fleet Director">HSE Fleet Director</option>
                      <option value="Rig Safety Officer">Rig Safety Officer</option>
                      <option value="Mechanical Isolation Lead">Mechanical Isolation Lead</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Security Clearance Passkey</label>
                  <div className="input-icon-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Set your password (e.g. oil123)" 
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn register-btn">
                  <span>PROVISION PERSONNEL & ENTER</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </form>
        )}

        <div className="auth-footer-notice">
          <span>🔒 ENCRYPTED ENTERPRISE SAFETY AUTHENTICATION • OIL INDIA LIMITED</span>
        </div>
      </div>
    </div>
  )
}
