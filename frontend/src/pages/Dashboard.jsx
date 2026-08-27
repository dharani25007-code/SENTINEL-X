import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  AlertTriangle, Shield, TrendingUp, MapPin, Radio, Activity,
  FileText, ArrowUpRight, Sliders, Orbit, CheckCircle2, ChevronRight, Lock, Globe
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LabelList
} from 'recharts'

function CustomTrajectoryTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {}
    return (
      <div style={{
        background: '#0B171C',
        border: '1px solid #1B323D',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        minWidth: 190
      }}>
        <div style={{ fontWeight: 700, color: '#E8F1F5', marginBottom: 6, fontSize: 13, borderBottom: '1px solid #162932', paddingBottom: 4 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, color: '#21D4FD', marginBottom: 4 }}>
          <span>Total Reports:</span>
          <span style={{ fontWeight: 700 }}>{data.total}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, color: '#FF4655', marginBottom: 4 }}>
          <span>SIF Precursors:</span>
          <span style={{ fontWeight: 700 }}>{data.sif}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, color: '#7E95A0', borderTop: '1px solid #162932', paddingTop: 4, marginTop: 4 }}>
          <span>Precursor Rate:</span>
          <span style={{ fontWeight: 700, color: Number(data.density) > 25 ? '#FF4655' : '#00E5FF' }}>
            {data.density}%
          </span>
        </div>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timelineMode, setTimelineMode] = useState('yearly') // 'yearly' or 'monthly'

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="empty-state" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan-ai)', marginTop: 16 }}>
          INITIALIZING HSE COMMAND TELEMETRY...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ border: '1px solid var(--red-critical)', background: 'var(--bg-deep)' }}>
        <h3 style={{ color: 'var(--red-critical)' }}>Telemetry Uplink Offline</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{error}</p>
      </div>
    )
  }

  const rawTrend = stats?.trend || []

  // 1. Yearly Aggregation across all years (2015 to 2026)
  const yearlyMap = {}
  rawTrend.forEach(t => {
    if (!t.month) return
    const yr = t.month.split('-')[0]
    if (!yearlyMap[yr]) {
      yearlyMap[yr] = { year: yr, label: yr, total: 0, sif: 0 }
    }
    yearlyMap[yr].total += t.total
    yearlyMap[yr].sif += t.sif_count
  })

  const yearlyTrendData = Object.values(yearlyMap)
    .sort((a, b) => a.year.localeCompare(b.year))
    .map(d => ({
      rawMonth: d.year,
      month: d.year,
      total: d.total,
      sif: d.sif,
      density: d.total > 0 ? ((d.sif / d.total) * 100).toFixed(1) : '0.0'
    }))

  // 2. High-Resolution Monthly Horizon (Focus on recent 14-month operational period)
  const formatMonthLabel = (mStr) => {
    if (!mStr) return ''
    const parts = mStr.split('-')
    if (parts.length === 2) {
      const yr = parts[0].substring(2)
      const mo = parseInt(parts[1], 10)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[mo - 1]} '${yr}`
    }
    return mStr
  }

  // Slices the most recent 14 months so monthly view is clean, spacious, and legible
  const monthlySlice = rawTrend.length > 14 ? rawTrend.slice(-14) : rawTrend
  const monthlyTrendData = monthlySlice.map(t => ({
    rawMonth: t.month,
    month: formatMonthLabel(t.month),
    total: t.total,
    sif: t.sif_count,
    density: t.total > 0 ? ((t.sif_count / t.total) * 100).toFixed(1) : '0.0'
  }))

  const trendData = timelineMode === 'yearly' && yearlyTrendData.length > 1 ? yearlyTrendData : monthlyTrendData

  const ruleData = stats.by_rule.map(r => ({
    name: r.rule,
    fullName: r.rule,
    count: r.count,
  }))

  const isFleetDirector = user?.clearance?.includes('Executive') || user?.role?.includes('Director') || user?.facility?.includes('All')

  return (
    <div className="dashboard-wrapper">
      {/* Executive Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="topic-pill">
              <Radio size={12} className="pulse-dot" />
              <span>OIL INDIA LIMITED • AUTONOMOUS HSE COMMAND CENTER</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 8 }}>
              Safety Intelligence Telemetry
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              {isFleetDirector 
                ? '🌐 Fleet-Wide Surveillance & Precursor Trajectory modeling across all Assam upstream drilling & pipeline networks'
                : `🔒 Scoped Telemetry Feed: ${user?.facility || 'Assigned Operational Asset'} (${user?.name || 'Authorized Lead'})`}
            </p>
          </div>
          <div className="live-telemetry-badge">
            <span className="live-dot"></span>
            <span>{isFleetDirector ? 'FLEET ACCESS • TIER-1' : `${user?.role || 'SITE SCOPED'} • TIER-2`}</span>
          </div>
        </div>
      </div>

      {/* 4 Spacious KPI Stat Cards */}
      <div className="kpi-grid">
        {/* Card 1 */}
        <div className="kpi-card cyan">
          <div className="kpi-header">
            <span className="kpi-label">TOTAL FIELD OBSERVATIONS</span>
            <FileText size={18} color="var(--cyan-ai)" />
          </div>
          <div className="kpi-value">{stats.total_reports.toLocaleString()}</div>
          <div className="kpi-footer text-cyan">
            <span>↑ 12.4% Ingested this month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card red">
          <div className="kpi-header">
            <span className="kpi-label">SIF PRECURSORS (PSIF)</span>
            <AlertTriangle size={18} color="var(--red-critical)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--red-critical)' }}>{stats.sif_count.toLocaleString()}</div>
          <div className="kpi-footer text-red">
            <span>● High Fatal Energy Potential</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card amber">
          <div className="kpi-header">
            <span className="kpi-label">FLEET SIF PRECURSOR DENSITY</span>
            <Activity size={18} color="var(--amber-warn)" />
          </div>
          <div className="kpi-value">{stats.sif_density}%</div>
          <div className="kpi-footer text-amber">
            <span>Target Threshold: &lt; 15.0%</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span className="kpi-label">CRITICAL ASSET FACILITIES</span>
            <MapPin size={18} color="var(--emerald-safe)" />
          </div>
          <div className="kpi-value">{stats.high_risk_sites} <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>Sites</span></div>
          <div className="kpi-footer text-emerald">
            <span>Live Monitored (Assam Grid)</span>
          </div>
        </div>
      </div>

      {/* Sleek Incident Horizon Alert */}
      <div className="horizon-alert-card">
        <div className="horizon-left">
          <div className="horizon-icon">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="horizon-tag">CRITICAL PRECURSOR MOMENTUM DETECTED</span>
              <span className="horizon-momentum">+31.4% ACCELERATION</span>
            </div>
            <p className="horizon-desc">
              <strong>Energy Isolation / LOTO verification failures</strong> are clustering around turnaround operations at <strong>Duliajan Central Complex</strong> (47 correlated precursor logs).
            </p>
          </div>
        </div>
        <div className="horizon-actions">
          <a href="/simulator" className="horizon-btn primary">
            <Sliders size={13} />
            Simulate Intervention
          </a>
          <a href="/universe" className="horizon-btn secondary">
            <Orbit size={13} />
            Risk Universe
          </a>
        </div>
      </div>

      {/* 2 Clean Hero Charts */}
      <div className="charts-grid-spacious">
        {/* Left: Trend Chart */}
        <div className="chart-card-elevated">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>SIF Precursor Trajectory</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                {timelineMode === 'yearly' ? 'Multi-year annual fleet distribution (2015–2026)' : 'Continuous monthly observation telemetry'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'nowrap' }}>
              {/* Sleek Segmented Pill Toggle */}
              <div style={{ display: 'inline-flex', background: '#071318', padding: 2, borderRadius: 6, border: '1px solid #162932' }}>
                <button
                  type="button"
                  onClick={() => setTimelineMode('yearly')}
                  style={{
                    padding: '4px 11px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: timelineMode === 'yearly' ? 'var(--cyan-ai)' : 'transparent',
                    color: timelineMode === 'yearly' ? '#040D12' : '#7E95A0',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Year
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineMode('monthly')}
                  style={{
                    padding: '4px 11px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: timelineMode === 'monthly' ? 'var(--cyan-ai)' : 'transparent',
                    color: timelineMode === 'monthly' ? '#040D12' : '#7E95A0',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Month
                </button>
              </div>

              <div className="chart-legend" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
                <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A0B4BE', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  <span className="dot cyan" /> Total
                </span>
                <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A0B4BE', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  <span className="dot red" /> SIF Precursor
                </span>
              </div>
            </div>
          </div>
          <div style={{ height: 280, width: '100%', marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21D4FD" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#21D4FD" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4655" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF4655" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162932" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#7E95A0', fontSize: 10.5, fontFamily: 'var(--font-mono)' }} 
                  axisLine={{ stroke: '#1B323D' }} 
                  tickLine={false} 
                  interval="preserveStartEnd"
                  minTickGap={20}
                  dy={6}
                />
                <YAxis tick={{ fill: '#7E95A0', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTrajectoryTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#21D4FD" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Total Reports" />
                <Area type="monotone" dataKey="sif" stroke="#FF4655" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSif)" name="SIF Precursors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: IOGP Rules Bar Chart */}
        <div className="chart-card-elevated">
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>IOGP Life-Saving Rules Breakdown</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                Top fatal hazard categories categorized under Report 459 taxonomy
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)', fontWeight: 600, background: 'rgba(33, 212, 253, 0.1)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(33, 212, 253, 0.2)' }}>
              9 CONTROLS
            </span>
          </div>
          <div style={{ height: 305, width: '100%', marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleData} layout="vertical" margin={{ top: 4, right: 38, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162932" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#7E95A0', fontSize: 10.5, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#C5D6DF', fontSize: 11.5, fontWeight: 500 }} 
                  width={185} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{ background: '#0B171C', border: '1px solid #1B323D', borderRadius: 8, color: '#E8F1F5', fontFamily: 'var(--font-mono)' }}
                  formatter={(value, name, props) => [`${value} Precursors`, props.payload.fullName]}
                />
                <Bar dataKey="count" radius={[0, 5, 5, 0]} barSize={15}>
                  <LabelList 
                    dataKey="count" 
                    position="right" 
                    fill="#E8F1F5" 
                    fontSize={11} 
                    fontFamily="var(--font-mono)" 
                    fontWeight={700} 
                    offset={8} 
                  />
                  {ruleData.map((entry, i) => {
                    const color = i === 0 ? '#FF4655' : i === 1 ? '#FF6B4A' : i === 2 ? '#FFB020' : '#21D4FD'
                    return <Cell key={i} fill={color} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Facility Risk Matrix */}
      <div className="chart-card-elevated" style={{ marginTop: 24 }}>
        <div className="chart-header" style={{ marginBottom: 20 }}>
          <div>
            <h3>OIL Operational Facility Risk Matrix</h3>
            <p>Prioritized precursor density & intervention hierarchy across operating fields</p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            FACILITY SURVEILLANCE
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Operational Asset / Facility</th>
                <th>Total Ingested</th>
                <th>SIF Precursors</th>
                <th>Precursor Density</th>
                <th>Risk Density Spectrum</th>
                <th>Action Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.by_site.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#E8F1F5', fontSize: 13.5 }}>{s.site}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{s.total} logs</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-critical)', fontWeight: 700 }}>
                    {s.sif_count}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: s.sif_density > 30 ? 'var(--red-critical)' : s.sif_density > 20 ? 'var(--amber-warn)' : 'var(--emerald-safe)' }}>
                    {s.sif_density}%
                  </td>
                  <td style={{ width: 160 }}>
                    <div className="table-bar-track">
                      <div
                        className="table-bar-fill"
                        style={{
                          width: `${Math.min(100, s.sif_density * 2)}%`,
                          background: s.sif_density > 30 ? 'var(--red-critical)' : s.sif_density > 20 ? 'var(--amber-warn)' : 'var(--emerald-safe)'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${s.sif_density > 30 ? 'critical' : s.sif_density > 20 ? 'warning' : 'safe'}`}>
                      {s.sif_density > 30 ? '🔴 CRITICAL AUDIT' : s.sif_density > 20 ? '🟠 WATCHLIST' : '🟢 CONTROLLED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
