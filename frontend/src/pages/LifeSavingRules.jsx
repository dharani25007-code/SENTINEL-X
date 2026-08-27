import { useState, useEffect } from 'react'
import { getRules, getDashboardStats, getReports } from '../api'
import {
  Zap, Flame, Mountain, Car, Box, ClipboardCheck, ArrowUpCircle, AlertTriangle, ShieldOff,
  Shield, MapPin, Activity, Radio, ArrowRight
} from 'lucide-react'

const RULE_ICONS = {
  'Energy Isolation': Zap,
  'Hot Work': Flame,
  'Working at Height': Mountain,
  'Driving': Car,
  'Confined Space': Box,
  'Work Authorisation': ClipboardCheck,
  'Safe Mechanical Lifting': ArrowUpCircle,
  'Line of Fire': AlertTriangle,
  'Bypassing Safety Controls': ShieldOff,
}

export default function LifeSavingRules() {
  const [rules, setRules] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedRule, setSelectedRule] = useState(null)
  const [ruleReports, setRuleReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRules(), getDashboardStats()])
      .then(([r, s]) => {
        setRules(r)
        setStats(s)
        if (r && r.length > 0) {
          setSelectedRule(r[0])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedRule) {
      setLoadingReports(true)
      getReports({ rule: selectedRule.name, limit: 10 })
        .then(reports => {
          setRuleReports(reports)
          setLoadingReports(false)
        })
        .catch(() => setLoadingReports(false))
    }
  }, [selectedRule])

  if (loading) return <div className="loading-spinner" />

  const getRuleCount = (ruleName) => {
    if (!stats || !stats.by_rule) return 0
    const found = stats.by_rule.find(r => r.rule === ruleName)
    return found ? found.count : 0
  }

  const SelectedIcon = selectedRule ? (RULE_ICONS[selectedRule.name] || Shield) : Shield

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <Radio size={12} />
          <span>OIL INDIA LIMITED • IOGP REPORT 459 STANDARD</span>
        </div>
        <h2>IOGP Life-Saving Rules Command Explorer</h2>
        <p>Standardized taxonomy of 9 critical controls for high-energy fatal risk activities</p>
      </div>

      {/* 3x3 Rules Grid */}
      <div className="rules-grid mb-24">
        {rules.map(rule => {
          const Icon = RULE_ICONS[rule.name] || Shield
          const isSelected = selectedRule?.id === rule.id
          const count = getRuleCount(rule.name)

          return (
            <div
              key={rule.id}
              className="rule-card-item"
              style={{
                borderColor: isSelected ? 'var(--cyan-ai)' : undefined,
                background: isSelected ? 'var(--bg-card-elevated)' : undefined,
              }}
              onClick={() => setSelectedRule(rule)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="rule-icon-wrapper" style={{ color: isSelected ? 'var(--cyan-ai)' : 'var(--amber-warn)' }}>
                  <Icon size={22} />
                </div>
                <span className="rule-count" style={{ fontWeight: 700, color: count > 0 ? 'var(--red-critical)' : 'var(--text-muted)' }}>
                  {count} SIF Precursors
                </span>
              </div>
              <div className="rule-name">{rule.name}</div>
              <div className="rule-description">
                {rule.description.length > 115 ? rule.description.substring(0, 110) + '...' : rule.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: isSelected ? 'var(--cyan-ai)' : 'var(--text-muted)', marginTop: 'auto', paddingTop: 6 }}>
                <span>VIEW INTELLIGENCE</span>
                <ArrowRight size={12} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Rule Detail Command Panel */}
      {selectedRule && (
        <div className="card-elevated">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div className="rule-icon-wrapper" style={{ width: 52, height: 52, color: 'var(--cyan-ai)' }}>
              <SelectedIcon size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#E8F1F5' }}>{selectedRule.name}</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                {getRuleCount(selectedRule.name)} Active SIF Precursor Observations Logged Across OIL Facilities
              </p>
            </div>
          </div>

          <div style={{ padding: 18, background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: 22 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--cyan-ai)', fontWeight: 700, marginBottom: 6 }}>
              IOGP Mandatory Control Requirements
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#E8F1F5' }}>
              {selectedRule.description}
            </p>
          </div>

          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Telemetry: Recent Precursors Tagged to {selectedRule.name}
          </h4>

          {loadingReports && <div className="loading-spinner" />}

          {!loadingReports && ruleReports.length === 0 && (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Shield size={36} color="var(--cyan-ai)" style={{ opacity: 0.5 }} />
              <p>No recent reports logged under this rule</p>
            </div>
          )}

          {!loadingReports && ruleReports.length > 0 && (
            <div className="alerts-list">
              {ruleReports.map(report => (
                <div key={report.id} className="alert-card">
                  <div className="alert-severity critical" />
                  <div className="alert-content">
                    <div style={{ fontSize: 13.5, color: '#E8F1F5', lineHeight: 1.6, fontWeight: 500 }}>
                      {report.report_text}
                    </div>
                    <div className="alert-meta">
                      {report.site && <span><MapPin size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--cyan-ai)' }} />{report.site}</span>}
                      {report.activity && <span><Activity size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--amber-warn)' }} />{report.activity}</span>}
                      {report.confidence && <span>● Precursor Risk: <strong style={{ color: 'var(--red-critical)' }}>{Math.round(report.confidence * 100)}%</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
