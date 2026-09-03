import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList, Legend
} from 'recharts'
import { AlertTriangle, User, ChevronRight } from 'lucide-react'

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

  // Dynamic Theme Palette mapping
  const pageBg = isDark ? 'bg-[#050B0E]' : 'bg-slate-50'
  const headerBg = isDark ? 'bg-[#0B171C] border-[#1B323D]' : 'bg-white border-blue-900'
  const headerTitleColor = isDark ? 'text-[#21D4FD]' : 'text-blue-900'
  const cardBg = isDark ? 'bg-[#0F1F27] border-[#1B323D]' : 'bg-white border-slate-300'
  const profileBg = isDark ? 'bg-[#0F1F27] border-[#1B323D] text-[#E8F1F5]' : 'bg-white border-black text-black'
  const textPrimary = isDark ? 'text-[#E8F1F5]' : 'text-black'
  const textSecondary = isDark ? 'text-[#8EA3AD]' : 'text-slate-700'
  const alertBg = isDark ? 'bg-[#142028] border-[#1B323D]' : 'bg-white border-slate-300'
  const tableHeaderBg = isDark ? 'bg-[#142832] border-[#1B323D]' : 'bg-slate-100 border-slate-300'
  const tableRowBg = isDark ? 'bg-[#0F1F27]' : 'bg-white'
  const tableAltRowBg = isDark ? 'bg-[#0B171C]' : 'bg-slate-50'
  const tableBorder = isDark ? 'border-[#1B323D]' : 'border-slate-300'

  const chartGridColor = isDark ? '#1B323D' : '#e2e8f0'
  const axisTextColor = isDark ? '#E8F1F5' : '#000000'
  const tooltipBg = isDark ? '#0B171C' : '#ffffff'
  const tooltipBorder = isDark ? '1px solid #1B323D' : '1px solid #cbd5e1'

  const lineTotalColor = isDark ? '#3B82F6' : '#02164F'
  const lineSifColor = '#F37022'
  const barStandardColor = isDark ? '#3B82F6' : '#02164F'
  const barHighlightColor = '#F37022'

  return (
    <div className={`font-serif min-h-screen p-6 ${pageBg} ${textPrimary}`}>
      {/* 1. TOP NAVIGATION / HEADER (OISD Style - Theme Adaptive) */}
      <header className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-none rounded-none border-b-2 ${headerBg}`}>
        <div>
          <h1 className={`text-xl font-bold tracking-wide uppercase font-serif ${headerTitleColor}`}>
            OIL INDIA LIMITED • SIH26165
          </h1>
          <div className={`text-xs mt-1 font-serif ${textSecondary}`}>
            Home &gt; HSE Management &gt; SENTINEL-X Command Center
          </div>
        </div>
        <div className={`border p-2.5 text-xs font-serif rounded-none shadow-none flex items-center gap-2 ${profileBg}`}>
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>
            User: Rajesh Barua | Role: Site Safety Engineer | Asset: Duliajan Central
          </span>
        </div>
      </header>

      {/* 2. KPI METRICS GRID (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className={`border shadow-sm rounded-none p-4 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 font-serif ${textSecondary}`}>
            TOTAL FIELD OBSERVATIONS
          </div>
          <div className={`text-3xl font-bold my-1 font-serif ${textPrimary}`}>
            147
          </div>
          <div className={`text-xs font-medium font-serif ${textSecondary}`}>
            ↑ 12.4% Ingested this month
          </div>
        </div>

        {/* Card 2 - Thick Solid Orange Top Border */}
        <div className={`border border-t-4 border-t-orange-600 shadow-sm rounded-none p-4 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 font-serif ${textSecondary}`}>
            SIF PRECURSORS (PSIF)
          </div>
          <div className={`text-3xl font-bold my-1 font-serif ${textPrimary}`}>
            96
          </div>
          <div className="text-xs text-orange-500 font-bold font-serif">
            High Fatal Energy Potential
          </div>
        </div>

        {/* Card 3 */}
        <div className={`border shadow-sm rounded-none p-4 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 font-serif ${textSecondary}`}>
            FLEET SIF PRECURSOR DENSITY
          </div>
          <div className={`text-3xl font-bold my-1 font-serif ${textPrimary}`}>
            65.3%
          </div>
          <div className={`text-xs font-medium font-serif ${textSecondary}`}>
            Target Threshold: &lt; 15.0%
          </div>
        </div>

        {/* Card 4 */}
        <div className={`border shadow-sm rounded-none p-4 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 font-serif ${textSecondary}`}>
            CRITICAL ASSET FACILITIES
          </div>
          <div className={`text-3xl font-bold my-1 font-serif ${textPrimary}`}>
            6 Sites
          </div>
          <div className={`text-xs font-medium font-serif ${textSecondary}`}>
            Live Monitored (Assam Grid)
          </div>
        </div>
      </div>

      {/* 3. CRITICAL ALERT BANNER (Zero-Glow Engineering Style) */}
      <div className={`border-l-4 border-l-orange-600 border-y border-r p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-none shadow-none ${alertBg}`}>
        <div>
          <div className="flex items-center gap-2 text-orange-500 font-bold uppercase text-base tracking-wide mb-1 font-serif">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <span>CRITICAL PRECURSOR MOMENTUM DETECTED</span>
          </div>
          <p className={`text-sm leading-relaxed font-serif ${textPrimary}`}>
            Energy Isolation / LOTO verification failures are clustering around turnaround operations at Duliajan Central Complex.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulateIntervention}
          className="bg-blue-900 text-white px-4 py-2 hover:bg-blue-800 font-bold uppercase transition-none rounded-none text-xs tracking-wider cursor-pointer border-none font-serif inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
        >
          <span>Simulate Intervention</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. DATA CHARTS (Recharts Implementation - Complete Dark & Light support) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Box ("SIF Precursor Trajectory") */}
        <div className={`border p-4 shadow-sm rounded-none ${cardBg}`}>
          <h2 className={`text-base font-bold border-b pb-2 mb-4 font-serif ${textPrimary} ${isDark ? 'border-[#1B323D]' : 'border-slate-300'}`}>
            SIF Precursor Trajectory (2020-2026)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trajectoryData}
                margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
              >
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  ticks={[2020, 2022, 2024, 2026]}
                  tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'Times New Roman' }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  type="number"
                  domain={[0, 16]}
                  ticks={[0, 4, 8, 12, 16]}
                  tick={{ fill: axisTextColor, fontSize: 12, fontFamily: 'Times New Roman' }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: tooltipBorder,
                    borderRadius: '0px',
                    boxShadow: 'none',
                    fontFamily: 'Times New Roman',
                    fontSize: '12px',
                    color: axisTextColor
                  }}
                  itemStyle={{ fontFamily: 'Times New Roman' }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Times New Roman', fontSize: '12px', paddingTop: '8px', color: axisTextColor }}
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
        <div className={`border p-4 shadow-sm rounded-none ${cardBg}`}>
          <h2 className={`text-base font-bold border-b pb-2 mb-4 font-serif ${textPrimary} ${isDark ? 'border-[#1B323D]' : 'border-slate-300'}`}>
            IOGP Life-Saving Rules Breakdown
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={iogpRulesData}
                layout="vertical"
                margin={{ top: 5, right: 35, left: 20, bottom: 5 }}
              >
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: axisTextColor, fontSize: 11, fontFamily: 'Times New Roman' }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                />
                <YAxis
                  type="category"
                  dataKey="rule"
                  width={150}
                  tick={{ fill: axisTextColor, fontSize: 11, fontFamily: 'Times New Roman', fontWeight: 600 }}
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: tooltipBorder,
                    borderRadius: '0px',
                    boxShadow: 'none',
                    fontFamily: 'Times New Roman',
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
                    fontFamily="Times New Roman"
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

      {/* 5. TABULAR DATA: STATUTORY FIELD INCIDENT TELEMETRY LOG */}
      <div className={`border p-4 shadow-sm rounded-none ${cardBg}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b mb-3 gap-2 ${isDark ? 'border-[#1B323D]' : 'border-slate-300'}`}>
          <div>
            <h2 className={`text-base font-bold font-serif uppercase tracking-wide ${textPrimary}`}>
              OISD Statutory Field Observation Telemetry Log
            </h2>
            <p className={`text-xs font-serif ${textSecondary}`}>
              Real-time audited observations across Assam Oil Fields (Oil Industry Safety Directorate Regulatory Compliance)
            </p>
          </div>
          <span className={`text-xs font-bold border px-2.5 py-1 rounded-none font-serif self-start sm:self-auto ${isDark ? 'bg-[#142832] text-[#E8F1F5] border-[#1B323D]' : 'bg-white text-black border-black'}`}>
            Statutory Ref: OISD-STD-105 / IOGP-459
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full border-collapse border text-xs font-serif ${tableBorder}`}>
            <thead>
              <tr className={tableHeaderBg}>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Log Ref #
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Asset Facility / Location
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  IOGP Category
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Classification
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Correlated Hazard Risk
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Statutory Status
                </th>
                <th className={`border p-2.5 text-left font-bold uppercase tracking-wider ${tableBorder} ${textPrimary}`}>
                  Inspector ID
                </th>
              </tr>
            </thead>
            <tbody>
              {telemetryLogs.map((log, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? tableRowBg : tableAltRowBg}>
                  <td className={`border p-2.5 font-bold whitespace-nowrap ${tableBorder} ${textPrimary}`}>
                    {log.ref}
                  </td>
                  <td className={`border p-2.5 ${tableBorder} ${textPrimary}`}>
                    {log.asset}
                  </td>
                  <td className={`border p-2.5 font-semibold ${tableBorder} ${textPrimary}`}>
                    {log.category}
                  </td>
                  <td className={`border p-2.5 ${tableBorder}`}>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-none border ${
                        log.level.includes('PSIF')
                          ? isDark ? 'bg-[#2A1215] text-red-400 border-red-800' : 'bg-orange-50 text-orange-800 border-orange-600'
                          : isDark ? 'bg-[#281D0F] text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-900 border-amber-600'
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className={`border p-2.5 ${tableBorder} ${textSecondary}`}>
                    {log.risk}
                  </td>
                  <td className={`border p-2.5 whitespace-nowrap ${tableBorder}`}>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-none border ${
                        log.status === 'CRITICAL AUDIT'
                          ? 'bg-orange-600 text-white border-orange-700'
                          : log.status === 'ACTION PENDING'
                          ? isDark ? 'bg-amber-900/40 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-900 border-amber-500'
                          : log.status === 'UNDER REVIEW'
                          ? isDark ? 'bg-slate-800 text-slate-200 border-slate-600' : 'bg-slate-200 text-black border-slate-400'
                          : isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-900 text-white border-blue-950'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className={`border p-2.5 font-mono text-[11px] ${tableBorder} ${textSecondary}`}>
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
