import { useState, useEffect } from 'react'
import { getPatterns, getDashboardStats } from '../api'
import { AlertOctagon, MapPin, Activity, Shield, Network, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend
} from 'recharts'

const COLORS = ['#EF4444', '#F59E0B', '#22D3EE', '#14B8A6', '#22C55E', '#06B6D4']

const OIL_SITES_NETWORK = [
  { name: 'Duliajan Central Complex', density: '40.5%', risk: 'red', topRule: 'Energy Isolation', trend: '↑ 23%' },
  { name: 'Digboi Refinery Unit #2', density: '35.7%', risk: 'red', topRule: 'Hot Work', trend: '↑ 14%' },
  { name: 'Moran Drilling Rig #4', density: '28.1%', risk: 'amber', topRule: 'Lifting Operations', trend: '↓ 5%' },
  { name: 'Naharkatiya Gas Plant', density: '24.3%', risk: 'amber', topRule: 'Confined Space', trend: '↑ 8%' },
  { name: 'Pipeline Pump Station 7', density: '11.8%', risk: 'green', topRule: 'Driving', trend: '↓ 12%' },
]

export default function PatternIntel() {
  const [patterns, setPatterns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSiteNode, setSelectedSiteNode] = useState(OIL_SITES_NETWORK[0])

  useEffect(() => {
    Promise.all([getPatterns(), getDashboardStats()])
      .then(([p, s]) => {
        setPatterns(p)
        setStats(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-spinner" />

  const topPattern = patterns[0]

  const siteRuleData = {}
  patterns.forEach(p => {
    if (!siteRuleData[p.site]) siteRuleData[p.site] = { site: p.site }
    siteRuleData[p.site][p.rule] = (siteRuleData[p.site][p.rule] || 0) + p.count
  })
  const stackedData = Object.values(siteRuleData)
  const allRules = [...new Set(patterns.map(p => p.rule))]

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <Network size={12} />
          <span>OIL INDIA LIMITED • SYSTEMIC INTELLIGENCE</span>
        </div>
        <h2>Precursor Pattern Intelligence & Network</h2>
        <p>Correlating high-energy tasks, physical asset locations, and safety barrier breakdowns across OIL operations</p>
      </div>

      {/* Emerging Risk Notification Banner */}
      <div className="emerging-risk-banner">
        <AlertTriangle size={24} color="var(--amber-warn)" />
        <div>
          <strong style={{ color: 'var(--amber-warn)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            EMERGING SYSTEMIC RISK IDENTIFIED:
          </strong>
          <p style={{ fontSize: 13.5, color: '#E8F1F5', marginTop: 2 }}>
            <strong>Energy Isolation & LOTO failures</strong> increased by <strong>23.4%</strong> in <strong>Duliajan Central Complex</strong> over the last 30 days during active maintenance schedules.
          </p>
        </div>
      </div>

      {/* Site Risk Network Topology Nodes */}
      <div className="card mb-24">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3>OIL Facility Risk Network Nodes</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)' }}>
            TOPOLOGY: 5 ASSETS
          </span>
        </div>
        <div className="site-network-grid">
          {OIL_SITES_NETWORK.map((node, i) => (
            <div
              key={i}
              className="site-node-card"
              style={{
                borderColor: selectedSiteNode.name === node.name ? 'var(--cyan-ai)' : undefined,
                background: selectedSiteNode.name === node.name ? 'var(--bg-card-elevated)' : undefined,
              }}
              onClick={() => setSelectedSiteNode(node)}
            >
              <div className={`site-node-status ${node.risk}`} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8F1F5', marginBottom: 6 }}>{node.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: node.risk === 'red' ? 'var(--red-critical)' : 'var(--amber-warn)' }}>
                SIF Density: {node.density}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Primary: <span style={{ color: 'var(--cyan-ai)' }}>{node.topRule}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: node.trend.includes('↑') ? 'var(--red-critical)' : 'var(--emerald-safe)', marginTop: 4 }}>
                {node.trend} this month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero: Top Recurring Precursor */}
      {topPattern && (
        <div className="card mb-24" style={{ borderColor: 'rgba(239, 68, 68, 0.45)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--bg-card))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--red-critical)', fontWeight: 800 }}>
                #1 Priority Precursor Cluster (Targeted Safety Intervention)
              </span>
            </div>
            <span className="verdict-badge sif" style={{ fontSize: 11, padding: '4px 12px' }}>CRITICAL CLUSTER</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
            <div>
              <div className="stat-label">Operational Task</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{topPattern.activity}</div>
            </div>
            <div>
              <div className="stat-label">Asset Facility</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{topPattern.site}</div>
            </div>
            <div>
              <div className="stat-label">Failed Barrier (IOGP)</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--amber-warn)' }}>{topPattern.rule}</div>
            </div>
            <div>
              <div className="stat-label">Precursor Frequency</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--red-critical)' }}>{topPattern.count}</div>
            </div>
            <div>
              <div className="stat-label">Model Confidence</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>{Math.round(topPattern.avg_confidence * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Decision-Support Precursor Flow */}
      {topPattern && (
        <div className="flow-diagram mb-24">
          <div className="flow-node">
            <div className="flow-node-label">OIL Asset</div>
            <div className="flow-node-value">{topPattern.site}</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-node-label">High-Risk Task</div>
            <div className="flow-node-value">{topPattern.activity}</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <div className="flow-node-label">Barrier Failure</div>
            <div className="flow-node-value" style={{ color: 'var(--amber-warn)' }}>{topPattern.rule}</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node danger">
            <div className="flow-node-label">SIF Precursors</div>
            <div className="flow-node-value" style={{ color: 'var(--red-critical)', fontSize: 20 }}>🔴 {topPattern.count} Events</div>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node action">
            <div className="flow-node-label">Targeted Action</div>
            <div className="flow-node-value" style={{ color: 'var(--cyan-ai)' }}>⚡ Field LOTO Audit</div>
          </div>
        </div>
      )}

      {/* Stacked Bar Chart: Rules by Site */}
      {stackedData.length > 0 && (
        <div className="chart-card mb-24">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Cross-Facility Multi-Variable Distribution</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)' }}>
              CORRELATION MATRIX
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedData}>
              <XAxis dataKey="site" tick={{ fill: '#8EA3AD', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} />
              <YAxis tick={{ fill: '#8EA3AD', fontSize: 12, fontFamily: 'var(--font-mono)' }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111F25', border: '1px solid #24363E', borderRadius: 8, color: '#E8F1F5', fontFamily: 'var(--font-mono)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8EA3AD' }} />
              {allRules.map((rule, i) => (
                <Bar key={rule} dataKey={rule} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === allRules.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
