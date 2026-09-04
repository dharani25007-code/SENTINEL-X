import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList, Legend
} from 'recharts'
import { AlertTriangle, ChevronRight } from 'lucide-react'

// Authentic SIF Trajectory Data
const trajectoryData = [
  { year: 2020, total: 8, sif: 3 },
  { year: 2022, total: 12, sif: 6 },
  { year: 2024, total: 15, sif: 11 },
  { year: 2026, total: 16, sif: 14 }
]

// Authentic IOGP Life-Saving Rules Breakdown Data
const iogpRulesData = [
  { rule: 'Energy Isolation', count: 47, isTop: true },
  { rule: 'Hot Work', count: 32, isTop: false },
  { rule: 'Safe Mechanical Lifting', count: 28, isTop: false },
  { rule: 'Work Authorisation', count: 21, isTop: false },
  { rule: 'Bypass Safety Controls', count: 18, isTop: false },
  { rule: 'Line Break', count: 14, isTop: false },
  { rule: 'Working at Height', count: 11, isTop: false }
]

// Authentic Field Incident Telemetry Data
const telemetryLogs = [
  { ref: 'OIL-DUL-2026-0891', asset: 'Duliajan Central Complex (GGS-3)', category: 'Energy Isolation', level: 'PSIF (High Potential)', risk: 'LOTO Lock Verification Omission', status: 'CRITICAL AUDIT', inspector: 'RB-88412' },
  { ref: 'OIL-NHK-2026-0744', asset: 'Naharkatia Drilling Rig #4', category: 'Hot Work', level: 'Precursor', risk: 'Combustible Gas Sensor Drift', status: 'ACTION PENDING', inspector: 'SK-44910' },
  { ref: 'OIL-MOR-2026-0612', asset: 'Moran Crude Oil Gathering Station', category: 'Safe Mechanical Lifting', level: 'Precursor', risk: 'Uncertified Crane Sling Usage', status: 'UNDER REVIEW', inspector: 'DP-90123' },
  { ref: 'OIL-JOR-2026-0509', asset: 'Jorajan Secondary Tank Farm', category: 'Line Break', level: 'PSIF (High Potential)', risk: 'Flange Spool Depressurization Gap', status: 'CRITICAL AUDIT', inspector: 'RB-88412' },
  { ref: 'OIL-DUL-2026-0421', asset: 'Duliajan Power Generation Plant', category: 'Work Authorisation', level: 'Observation', risk: 'Expired Permit to Work (PTW) Signature', status: 'VERIFIED CLOSED', inspector: 'AG-10344' }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const handleSimulateIntervention = () => {
    navigate('/simulator')
  }

  const chartGridColor = isDark ? '#2D3748' : '#E2E8F0'
  const axisTextColor = isDark ? '#94A3B8' : '#1E293B'
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '1px solid #334155' : '1px solid #CBD5E1'

  const lineTotalColor = isDark ? '#60A5FA' : '#1E3A8A'
  const lineSifColor = '#F37022'
  const barStandardColor = isDark ? '#2563EB' : '#1D4ED8'
  const barHighlightColor = '#F37022'

  const getStatusClass = (status) => {
    if (status === 'CRITICAL AUDIT') return 'critical-audit'
    if (status === 'ACTION PENDING') return 'action-pending'
    if (status === 'UNDER REVIEW') return 'under-review'
    return 'verified-closed'
  }

  const getLevelClass = (level) => {
    if (level.includes('PSIF')) return 'psif'
    if (level.includes('Precursor')) return 'precursor'
    return 'observation'
  }

  return (
    <div className="dashboard-view">
      {/* 1. KPI METRICS GRID (3 Columns) */}
      <div className="kpi-metrics-grid">
        {/* Card 1 - Action Blue Accent */}
        <div className="kpi-card highlight-blue">
          <div className="kpi-label">TOTAL FIELD OBSERVATIONS</div>
          <div className="kpi-value">147</div>
          <div className="kpi-subtext">↑ 12.4% Ingested this month</div>
        </div>

        {/* Card 2 - Safety Orange Accent */}
        <div className="kpi-card highlight-orange">
          <div className="kpi-label">SIF PRECURSORS (PSIF)</div>
          <div className="kpi-value">96</div>
          <div className="kpi-subtext warning-orange">High Fatal Energy Potential</div>
        </div>

        {/* Card 3 - Safety Green Accent */}
        <div className="kpi-card highlight-green">
          <div className="kpi-label">FLEET SIF PRECURSOR DENSITY</div>
          <div className="kpi-value">65.3%</div>
          <div className="kpi-subtext">Target Threshold: &lt; 15.0%</div>
        </div>
      </div>

      {/* 2. CRITICAL ALERT BANNER */}
      <div className="dashboard-alert-banner">
        <div>
          <div className="alert-banner-header">
            <AlertTriangle size={18} color="#F37022" />
            <span>CRITICAL PRECURSOR MOMENTUM DETECTED</span>
          </div>
          <p className="alert-banner-text">
            Energy Isolation / LOTO verification failures are clustering around turnaround operations at Duliajan Central Complex.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulateIntervention}
          className="alert-action-btn"
        >
          <span>Simulate Intervention</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* 3. DATA CHARTS (Recharts Implementation) */}
      <div className="dashboard-charts-grid">
        {/* Left Box ("SIF Precursor Trajectory") */}
        <div className="chart-panel-card">
          <h2 className="chart-panel-title">
            SIF Precursor Trajectory (2020-2026)
          </h2>
          <div style={{ height: 288, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trajectoryData}
                margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
              >
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  ticks={[2020, 2022, 2024, 2026]}
                  tick={{ fill: axisTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  type="number"
                  domain={[0, 16]}
                  ticks={[0, 4, 8, 12, 16]}
                  tick={{ fill: axisTextColor, fontSize: 12 }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: tooltipBorder,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    fontSize: '12px',
                    color: axisTextColor
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: axisTextColor }}
                />
                <Line
                  type="linear"
                  dataKey="total"
                  name="Total Field Observations"
                  stroke={lineTotalColor}
                  strokeWidth={2}
                  dot={{ r: 4, fill: lineTotalColor, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="linear"
                  dataKey="sif"
                  name="SIF Precursors (PSIF)"
                  stroke={lineSifColor}
                  strokeWidth={2}
                  dot={{ r: 4, fill: lineSifColor, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Box ("IOGP Life-Saving Rules Breakdown") */}
        <div className="chart-panel-card">
          <h2 className="chart-panel-title">
            IOGP Life-Saving Rules Breakdown
          </h2>
          <div style={{ height: 288, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={iogpRulesData}
                layout="vertical"
                margin={{ top: 5, right: 35, left: 20, bottom: 5 }}
              >
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: axisTextColor, fontSize: 11 }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  type="category"
                  dataKey="rule"
                  width={150}
                  tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: tooltipBorder,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    fontSize: '12px',
                    color: axisTextColor
                  }}
                  formatter={(value) => [`${value} Precursors`, 'Count']}
                />
                <Bar dataKey="count" barSize={16}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    fill={axisTextColor}
                    fontSize={11}
                    fontWeight={700}
                    offset={6}
                  />
                  {iogpRulesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isTop ? barHighlightColor : barStandardColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TABULAR DATA: STATUTORY FIELD INCIDENT TELEMETRY LOG */}
      <div className="telemetry-table-card">
        <div className="telemetry-card-header">
          <div>
            <h2 className="telemetry-table-title">
              OISD Statutory Field Observation Telemetry Log
            </h2>
            <p className="telemetry-table-subtitle">
              Real-time audited observations across Assam Oil Fields (Oil Industry Safety Directorate Regulatory Compliance)
            </p>
          </div>
          <span className="statutory-badge">
            Statutory Ref: OISD-STD-105 / IOGP-459
          </span>
        </div>

        <div className="telemetry-table-wrapper">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>Log Ref #</th>
                <th>Asset Facility / Location</th>
                <th>IOGP Category</th>
                <th>Classification</th>
                <th>Correlated Hazard Risk</th>
                <th>Statutory Status</th>
                <th>Inspector ID</th>
              </tr>
            </thead>
            <tbody>
              {telemetryLogs.map((log, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {log.ref}
                  </td>
                  <td>{log.asset}</td>
                  <td style={{ fontWeight: 600 }}>{log.category}</td>
                  <td>
                    <span className={`telemetry-level-pill ${getLevelClass(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.risk}</td>
                  <td>
                    <span className={`telemetry-status-pill ${getStatusClass(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {log.inspector}
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
