import { useState, useEffect } from 'react'
import { getReports } from '../api'
import { Clock, MapPin, Shield, Radio, CheckCircle, Eye } from 'lucide-react'

function timeAgo(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function getSeverity(confidence) {
  if (confidence >= 0.9) return 'critical'
  if (confidence >= 0.8) return 'high'
  return 'medium'
}

function getSeverityLabel(confidence) {
  if (confidence >= 0.9) return '🔴 CRITICAL SIF PRECURSOR'
  if (confidence >= 0.8) return '🟠 HIGH RISK PRECURSOR'
  return '🟡 MEDIUM PRECURSOR'
}

export default function SifAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ site: '', rule: '' })
  const [expandedId, setExpandedId] = useState(null)
  const [acknowledged, setAcknowledged] = useState({})

  useEffect(() => {
    const params = { verdict: 'SIF-potential', limit: 100 }
    if (filter.site) params.site = filter.site
    if (filter.rule) params.rule = filter.rule

    setLoading(true)
    getReports(params)
      .then(data => {
        setAlerts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [filter])

  const toggleAck = (id, e) => {
    e.stopPropagation()
    setAcknowledged(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const sites = [...new Set(alerts.map(a => a.site).filter(Boolean))]
  const rules = [...new Set(alerts.map(a => a.iogp_rule).filter(Boolean))]

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <Radio size={12} />
          <span>OIL INDIA LIMITED • OPERATIONAL SAFETY QUEUE</span>
        </div>
        <h2>SIF Precursor Triage Queue</h2>
        <p>Real-time operational triage queue for active SIF-potential precursors across OIL assets</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={filter.site}
          onChange={e => setFilter(f => ({ ...f, site: e.target.value }))}
        >
          <option value="">All Operational Facilities</option>
          {sites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="filter-select"
          value={filter.rule}
          onChange={e => setFilter(f => ({ ...f, rule: e.target.value }))}
        >
          <option value="">All IOGP Life-Saving Rules</option>
          {rules.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-ai)', fontSize: 12, alignSelf: 'center' }}>
          [{alerts.length} ACTIVE SIF PRECURSORS DETECTED]
        </span>
      </div>

      {loading && <div className="loading-spinner" />}

      {!loading && alerts.length === 0 && (
        <div className="empty-state">
          <Shield size={48} color="var(--cyan-ai)" style={{ opacity: 0.5 }} />
          <p>No active SIF precursor alerts matching current criteria</p>
        </div>
      )}

      {/* Operational Alert Cards */}
      <div className="alerts-list">
        {alerts.map(alert => {
          const isAck = acknowledged[alert.id]
          const sev = getSeverity(alert.confidence)

          return (
            <div
              key={alert.id}
              className="alert-card"
              onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              style={{ opacity: isAck ? 0.65 : 1 }}
            >
              <div className={`alert-severity ${sev}`} />
              <div className="alert-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="alert-rule">
                      {alert.iogp_rule ? `⚡ ${alert.iogp_rule}` : '⚠️ High-Energy SIF Precursor'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: sev === 'critical' ? 'var(--red-critical)' : 'var(--amber-warn)', marginTop: 2 }}>
                      {getSeverityLabel(alert.confidence)}
                    </div>
                  </div>
                  <div className="alert-confidence">
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>RISK: </span>
                    <span style={{ color: sev === 'critical' ? 'var(--red-critical)' : 'var(--amber-warn)' }}>
                      {Math.round(alert.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="alert-meta">
                  {alert.site && <span><MapPin size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--cyan-ai)' }} />{alert.site}</span>}
                  {alert.activity && <span><Shield size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--amber-warn)' }} />{alert.activity}</span>}
                  <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{timeAgo(alert.created_at)}</span>
                </div>

                <div className="alert-actions">
                  <button
                    className="btn-action-outline"
                    onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === alert.id ? null : alert.id); }}
                  >
                    <Eye size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {expandedId === alert.id ? 'COLLAPSE AUDIT' : 'REVIEW AUDIT'}
                  </button>
                  <button
                    className="btn-action-outline"
                    style={{ borderColor: isAck ? 'var(--emerald-safe)' : 'var(--border-color)', color: isAck ? 'var(--emerald-safe)' : 'var(--text-secondary)' }}
                    onClick={(e) => toggleAck(alert.id, e)}
                  >
                    <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {isAck ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                  </button>
                </div>

                {expandedId === alert.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--cyan-ai)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>FIELD REPORT: </strong>
                      {alert.report_text}
                    </div>
                    {alert.reasoning && (
                      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-deep)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                        <strong style={{ color: 'var(--amber-warn)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>AI PRECURSOR DETERMINATION: </strong>
                        {alert.reasoning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
