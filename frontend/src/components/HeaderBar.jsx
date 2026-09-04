import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Building2, FileText, Sun, Moon } from 'lucide-react'
import AuditReportModal from './AuditReportModal'

export default function HeaderBar() {
  const { toggleTheme, isDark } = useTheme()
  const [auditModalOpen, setAuditModalOpen] = useState(false)

  return (
    <>
      <header className="top-header-bar">
        <div className="header-left">
          <div className="active-facility-tag">
            <Building2 size={13} color="var(--text-muted)" />
            <span className="facility-label">OPERATIONAL ASSET:</span>
            <span className="facility-name" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>All OIL Assets (Assam HQ)</span>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Dynamic Theme Switcher (Light vs Dark) */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'Light Mode' : 'Dark Mode'}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isDark ? (
              <>
                <Sun size={13} color="#F59E0B" />
                <span>LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={13} color="#818CF8" />
                <span>DARK</span>
              </>
            )}
          </button>

          {/* 1-Click OISD Compliance Audit Export Button */}
          <button
            type="button"
            onClick={() => setAuditModalOpen(true)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: '6px',
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
            <FileText size={13} color="var(--text-muted)" />
            <span>EXPORT OISD AUDIT (PDF)</span>
          </button>
        </div>
      </header>

      <AuditReportModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />
    </>
  )
}
