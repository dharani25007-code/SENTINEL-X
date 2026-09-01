import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Shield, ChevronDown, LogOut, UserCheck, Sparkles, Building2, User, FileText, Sun, Moon } from 'lucide-react'
import AuditReportModal from './AuditReportModal'

export default function HeaderBar() {
  const { user, loginAsPersona, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleSelectPersona = (personaId) => {
    loginAsPersona(personaId)
    setDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/auth')
  }

  return (
    <>
      <header className="top-header-bar">
        <div className="header-left">
          <div className="active-facility-tag">
            <Building2 size={13} color="var(--cyan-ai)" />
            <span className="facility-label">OPERATIONAL ASSET:</span>
            <span className="facility-name">{user?.facility || 'Duliajan Central Complex'}</span>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Dynamic Theme Switcher (Vercel Light vs Industrial Dark) */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Ultra-Minimalist Light Mode' : 'Industrial Dark SCADA Mode'}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {isDark ? (
              <>
                <Sun size={13} color="#F59E0B" />
                <span>LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={13} color="#6366F1" />
                <span>DARK</span>
              </>
            )}
          </button>

          {/* 1-Click OISD Compliance Audit Export Button */}
          <button
            type="button"
            onClick={() => setAuditModalOpen(true)}
            style={{
              background: 'var(--cyan-subtle)',
              border: '1px solid var(--border-cyan)',
              color: 'var(--cyan-ai)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <FileText size={13} />
            <span>EXPORT OISD AUDIT (PDF)</span>
          </button>
        {user ? (
          <div className="user-profile-menu-container">
            <button 
              type="button" 
              className="user-profile-pill"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar-badge">{user.avatar || '🛡️'}</div>
              <div className="user-text-info">
                <span className="user-name">{user.name}</span>
                <span className="user-badge-id">{user.badge} • <span className="user-role-text">{user.role}</span></span>
              </div>
              <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown-card">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar">{user.avatar || '🛡️'}</div>
                  <div className="dropdown-details">
                    <h4>{user.name}</h4>
                    <span className="clearance-tag">{user.clearance || 'Tier-2 Verified'}</span>
                    <p className="dropdown-facility">{user.facility}</p>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section-title">
                  <Sparkles size={12} color="var(--cyan-ai)" />
                  <span>SWITCH DEMO PERSONA:</span>
                </div>

                <div className="dropdown-personas-list">
                  {DEMO_PERSONAS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`dropdown-persona-item ${user.id === p.id ? 'active' : ''}`}
                      onClick={() => handleSelectPersona(p.id)}
                    >
                      <span className="item-avatar">{p.avatar}</span>
                      <div className="item-details">
                        <span className="item-name">{p.name}</span>
                        <span className="item-sub">{p.role} ({p.badge})</span>
                      </div>
                      {user.id === p.id && <span className="active-dot"></span>}
                    </button>
                  ))}
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-actions">
                  <button 
                    type="button" 
                    className="dropdown-action-btn onboard-btn"
                    onClick={() => { setDropdownOpen(false); navigate('/auth'); }}
                  >
                    <UserCheck size={14} />
                    <span>Onboard New Personnel</span>
                  </button>

                  <button 
                    type="button" 
                    className="dropdown-action-btn signout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            type="button" 
            className="auth-header-btn"
            onClick={() => navigate('/auth')}
          >
            <User size={14} />
            <span>Sign In / Onboard</span>
          </button>
        )}
      </div>
    </header>

    <AuditReportModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />
    </>
  )
}
