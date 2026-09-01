import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext'
import { Shield, ChevronDown, LogOut, UserCheck, Sparkles, Building2, User, FileText } from 'lucide-react'
import AuditReportModal from './AuditReportModal'

export default function HeaderBar() {
  const { user, loginAsPersona, logout } = useAuth()
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

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 1-Click OISD Compliance Audit Export Button */}
          <button
            type="button"
            onClick={() => setAuditModalOpen(true)}
            style={{
              background: 'rgba(33, 212, 253, 0.1)',
              border: '1px solid rgba(33, 212, 253, 0.35)',
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(33, 212, 253, 0.2)'
              e.currentTarget.style.boxShadow = '0 0 14px var(--cyan-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(33, 212, 253, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
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
