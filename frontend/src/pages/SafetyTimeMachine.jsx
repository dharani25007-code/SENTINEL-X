import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { History, TrendingUp, AlertTriangle, FastForward, Play, ShieldAlert, Calendar, Building2, Layers } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

// 12-Year Multi-Field Historical Epochs (2014–2026) Across All 6 Assam Assets
const HISTORICAL_12Y_DATA = [
  {
    step: 0,
    year: '2014–2016',
    label: '2014–2016 (Baseline Exploration)',
    count: 22,
    sifCount: 8,
    momentum: 'Baseline Stable',
    status: 'CONTROLLED STEADY-STATE',
    statusColor: '#00A86B',
    narrative: 'Fleet-wide baseline across Duliajan and Digboi: Standard crude extraction and routine mechanical pump overhauls. 22 statutory logs recorded with isolated slip/trip housekeeping.',
    sifProbability: '18.4%',
    primaryAsset: 'Duliajan & Digboi Assets',
    chartData: [
      { epoch: '2014', total: 6, sif: 2 },
      { epoch: '2015', total: 14, sif: 5 },
      { epoch: '2016', total: 22, sif: 8 }
    ]
  },
  {
    step: 1,
    year: '2017–2019',
    label: '2017–2019 (Deep Drilling Expansion)',
    count: 54,
    sifCount: 28,
    momentum: '+42.5% Precursor Growth',
    status: 'ELEVATED DRILLING HAZARDS',
    statusColor: '#F37022',
    narrative: 'High-pressure drilling expansion across Moran Rig #4 and Naharkatiya Gas Plant: Catline cable snaps and tripping near-misses begin clustering due to high-pace drilling targets.',
    sifProbability: '54.2%',
    primaryAsset: 'Moran Rig #4 & Naharkatiya',
    chartData: [
      { epoch: '2014', total: 6, sif: 2 },
      { epoch: '2016', total: 22, sif: 8 },
      { epoch: '2017', total: 32, sif: 14 },
      { epoch: '2018', total: 44, sif: 21 },
      { epoch: '2019', total: 54, sif: 28 }
    ]
  },
  {
    step: 2,
    year: '2020',
    label: '2020 (Baghjan Precursor Surge)',
    count: 85,
    sifCount: 54,
    momentum: '+68.2% SPIKE',
    status: 'CRITICAL HIGH-ENERGY SIF SURGE',
    statusColor: '#C04500',
    narrative: 'Critical blowout precursor surge: Uncontrolled gas kicks and kill fluid hydrostatic column depletion logged in daily workover reports prior to the Baghjan wellhead blowout.',
    sifProbability: '96.8%',
    primaryAsset: 'Baghjan & Moran Workover Wells',
    chartData: [
      { epoch: '2014', total: 6, sif: 2 },
      { epoch: '2016', total: 22, sif: 8 },
      { epoch: '2018', total: 44, sif: 21 },
      { epoch: '2019', total: 54, sif: 28 },
      { epoch: '2020 (Surge)', total: 85, sif: 54 }
    ]
  },
  {
    step: 3,
    year: '2021–2023',
    label: '2021–2023 (Refinery & Pipeline Turnaround)',
    count: 116,
    sifCount: 71,
    momentum: '+36.5% Drift',
    status: 'HOT WORK & LOTO DRIFT',
    statusColor: '#F37022',
    narrative: 'Refinery turnaround and pipeline maintenance at Digboi and Pump Station 7: Multiple instances of torch cutting without continuous LEL gas monitors and unverified electrical breaker isolations.',
    sifProbability: '64.5%',
    primaryAsset: 'Digboi Refinery & PS-7 Pipeline',
    chartData: [
      { epoch: '2014', total: 6, sif: 2 },
      { epoch: '2016', total: 22, sif: 8 },
      { epoch: '2018', total: 44, sif: 21 },
      { epoch: '2020', total: 85, sif: 54 },
      { epoch: '2021', total: 96, sif: 60 },
      { epoch: '2022', total: 106, sif: 65 },
      { epoch: '2023', total: 116, sif: 71 }
    ]
  },
  {
    step: 4,
    year: '2024–2026',
    label: '2024–2026 (Live Sentinel-X Autonomous Defense)',
    count: 138,
    sifCount: 82,
    momentum: 'Proactive AI Defense Active',
    status: 'AI PROACTIVE INTERCEPTION ACTIVE',
    statusColor: '#1D4ED8',
    narrative: 'SENTINEL-X Fleet Deployment: Full real-time ingestion across all 6 Assam facilities. 82 high-energy SIF precursors intercepted and dispatched into engineering work orders before catastrophic escalation.',
    sifProbability: '28.0% (CONTROLLED)',
    primaryAsset: 'All 6 Assam Operational Facilities',
    chartData: [
      { epoch: '2014', total: 6, sif: 2 },
      { epoch: '2016', total: 22, sif: 8 },
      { epoch: '2018', total: 44, sif: 21 },
      { epoch: '2020 (Surge)', total: 85, sif: 54 },
      { epoch: '2022', total: 106, sif: 65 },
      { epoch: '2024', total: 128, sif: 77 },
      { epoch: '2026 (Live)', total: 138, sif: 82 }
    ]
  }
]

// 30-Day Operational Zoom Precursor Playback
const OPERATIONAL_30D_DATA = [
  {
    step: 0,
    label: 'Day -30 (Controlled Baseline)',
    count: 5,
    sifCount: 1,
    momentum: '+4%',
    status: 'CONTROLLED',
    statusColor: '#00A86B',
    narrative: 'Fleet Baseline across Assam: Isolated minor valve seep logged during routine maintenance at Duliajan. Standard PTW active, zero high-energy exposure.',
    sifProbability: '14.2%',
    primaryAsset: 'Duliajan Central Complex',
    chartData: [
      { epoch: 'Day 1', total: 1, sif: 0 },
      { epoch: 'Day 5', total: 2, sif: 0 },
      { epoch: 'Day 10', total: 5, sif: 1 }
    ]
  },
  {
    step: 1,
    label: 'Day -20 (Procedural Drift)',
    count: 14,
    sifCount: 6,
    momentum: '+18%',
    status: 'WATCHLIST',
    statusColor: '#F37022',
    narrative: 'Initial Precursor Clustering: Turnaround contractors noted bypassing tagout verification to meet turnaround speed targets at Duliajan and Digboi.',
    sifProbability: '38.5%',
    primaryAsset: 'Duliajan & Digboi Refinery',
    chartData: [
      { epoch: 'Day 1', total: 1, sif: 0 },
      { epoch: 'Day 5', total: 2, sif: 0 },
      { epoch: 'Day 10', total: 5, sif: 1 },
      { epoch: 'Day 15', total: 9, sif: 4 },
      { epoch: 'Day 20', total: 14, sif: 6 }
    ]
  },
  {
    step: 2,
    label: 'Day -10 (Critical Interception Window)',
    count: 24,
    sifCount: 16,
    momentum: '+32%',
    status: 'HIGH ALERT (INTERCEPT NOW)',
    statusColor: '#F37022',
    narrative: 'Multiple high-pressure crude pump overhauls conducted with bypassed physical lockouts and omitted explosive gas checks. Near-miss energy release reported.',
    sifProbability: '68.0%',
    primaryAsset: 'Duliajan, Digboi & Moran Rig 4',
    chartData: [
      { epoch: 'Day 1', total: 1, sif: 0 },
      { epoch: 'Day 10', total: 5, sif: 1 },
      { epoch: 'Day 20', total: 14, sif: 6 },
      { epoch: 'Day 25', total: 24, sif: 16 }
    ]
  },
  {
    step: 3,
    label: 'Day 0 (Imminent SIF Horizon)',
    count: 38,
    sifCount: 31,
    momentum: '+48.4%',
    status: 'CRITICAL SIF PRECURSOR CONVERGENCE',
    statusColor: '#C04500',
    narrative: 'CRITICAL ESCALATION: 31 SIF precursor observations correlate Energy Isolation and Hot Work breaches. Imminent fatality risk if barrier chain is not broken.',
    sifProbability: '94.6%',
    primaryAsset: 'All 6 Assam Assets',
    chartData: [
      { epoch: 'Day 1', total: 1, sif: 0 },
      { epoch: 'Day 10', total: 5, sif: 1 },
      { epoch: 'Day 20', total: 14, sif: 6 },
      { epoch: 'Day 25', total: 24, sif: 16 },
      { epoch: 'Day 30', total: 38, sif: 31 }
    ]
  }
]

export default function SafetyTimeMachine() {
  const { isDark } = useTheme()
  const [viewMode, setViewMode] = useState('12Y') // '12Y' or '30D'
  const [currentStep, setCurrentStep] = useState(viewMode === '12Y' ? 4 : 3)
  const [selectedFacility, setSelectedFacility] = useState('ALL')

  const activeDataset = viewMode === '12Y' ? HISTORICAL_12Y_DATA : OPERATIONAL_30D_DATA
  const maxStep = activeDataset.length - 1
  const safeStep = Math.min(currentStep, maxStep)
  const current = activeDataset[safeStep]

  const totalLineColor = isDark ? '#FFFFFF' : '#0F172A'

  const handleModeChange = (mode) => {
    setViewMode(mode)
    setCurrentStep(mode === '12Y' ? 4 : 3)
  }

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <History size={12} />
          <span>OIL INDIA LIMITED • FLEET-WIDE TEMPORAL INTELLIGENCE</span>
        </div>
        <h2>Safety Time Machine (Historical & Precursor Replay)</h2>
        <p>Replay 12 years of Oil India statutory history (2014–2026) across all 6 Assam oilfields or zoom into the 30-day pre-disaster escalation window</p>
      </div>

      {/* Control Bar: Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 }}>
        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', background: 'var(--bg-deep)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)', gap: 4 }}>
          <button
            onClick={() => handleModeChange('12Y')}
            className={`tab-btn ${viewMode === '12Y' ? 'active' : ''}`}
            style={{
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: viewMode === '12Y' ? '#1D4ED8' : 'transparent',
              color: viewMode === '12Y' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            12-Year Fleet Horizon (2014–2026)
          </button>
          <button
            onClick={() => handleModeChange('30D')}
            className={`tab-btn ${viewMode === '30D' ? 'active' : ''}`}
            style={{
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: viewMode === '30D' ? '#1D4ED8' : 'transparent',
              color: viewMode === '30D' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <FastForward size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            30-Day Operational SIF Playback
          </button>
        </div>
      </div>

      {/* Interactive Time Slider Box */}
      <div className="timeline-slider-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="stat-label">TEMPORAL REPLAY POSITION • {viewMode === '12Y' ? 'HISTORICAL ERA' : 'PRECURSOR DAY'}</span>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)' }}>{current.label}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: current.statusColor, fontWeight: 700, background: 'var(--bg-deep)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
            ● {current.status}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={maxStep}
          step="1"
          value={safeStep}
          onChange={e => setCurrentStep(parseInt(e.target.value))}
          className="timeline-slider"
          style={{ accentColor: '#1D4ED8', marginTop: 14 }}
        />

        <div className="timeline-ticks" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          {activeDataset.map((t, i) => (
            <span
              key={i}
              className={i === safeStep ? 'timeline-tick-active' : ''}
              onClick={() => setCurrentStep(i)}
              style={{
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: i === safeStep ? (isDark ? '#FFFFFF' : '#1D4ED8') : 'var(--text-muted)',
                fontWeight: i === safeStep ? 800 : 500
              }}
            >
              {viewMode === '12Y' ? t.year : t.label.split(' ')[0] + ' ' + t.label.split(' ')[1]}
            </span>
          ))}
        </div>
      </div>

      {/* Trajectory Breakdown & Intelligence */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginTop: 20 }}>
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Fleet Precursor Volume vs SIF Precursors</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assam Asset Focus: {current.primaryAsset}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: current.statusColor, fontWeight: 700 }}>
              {current.momentum}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={current.chartData}>
              <defs>
                <linearGradient id="totalReportsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={totalLineColor} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={totalLineColor} stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="sifPrecursorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F37022" stopOpacity={0.40}/>
                  <stop offset="95%" stopColor="#F37022" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
              <XAxis dataKey="epoch" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', borderRadius: '6px' }} />
              <Area type="monotone" dataKey="total" name="Total Reports" stroke={totalLineColor} fill="url(#totalReportsGrad)" strokeWidth={2.2} />
              <Area type="monotone" dataKey="sif" name="SIF Precursors" stroke="#F37022" fill="url(#sifPrecursorsGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated">
          <div className="input-label" style={{ color: 'var(--text-secondary)' }}>Fleet Temporal Assessment</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 14px' }}>
            {viewMode === '12Y' ? '12-Year Historical Milestone' : '30-Day Precursor Accrual Chain'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 10, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div className="stat-label">Total Ingested</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{current.count}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{current.sifCount} SIF Precursors</div>
            </div>
            <div style={{ padding: 10, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div className="stat-label">Calculated SIF Risk</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: current.statusColor }}>{current.sifProbability}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{current.momentum}</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-deep)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            "{current.narrative}"
          </p>
        </div>
      </div>
    </div>
  )
}
