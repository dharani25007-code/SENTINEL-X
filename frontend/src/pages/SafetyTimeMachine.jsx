import { useState } from 'react'
import { History, TrendingUp, AlertTriangle, FastForward, Play, ShieldAlert } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const TIMELINE_DATA = [
  {
    step: 0,
    label: '30 Days Ago',
    count: 5,
    momentum: '+4%',
    status: 'CONTROLLED',
    statusColor: 'var(--emerald-safe)',
    narrative: 'Isolated observation: minor valve leakage logged during routine maintenance. Standard permit-to-work active.',
    sifProbability: '14%',
    chartData: [
      { day: 'Day 1', count: 1 }, { day: 'Day 5', count: 2 }, { day: 'Day 10', count: 5 }
    ]
  },
  {
    step: 1,
    label: '20 Days Ago',
    count: 12,
    momentum: '+14%',
    status: 'WATCHLIST',
    statusColor: 'var(--amber-warn)',
    narrative: 'Initial precursor clustering: contractors noted bypassing tagout verification to meet turnaround speed targets at Duliajan.',
    sifProbability: '38%',
    chartData: [
      { day: 'Day 1', count: 1 }, { day: 'Day 5', count: 2 }, { day: 'Day 10', count: 5 },
      { day: 'Day 15', count: 8 }, { day: 'Day 20', count: 12 }
    ]
  },
  {
    step: 2,
    label: '10 Days Ago',
    count: 19,
    momentum: '+24%',
    status: 'HIGH ALERT',
    statusColor: 'var(--amber-warn)',
    narrative: 'Multiple high-pressure pump interventions conducted with incomplete zero-energy verification. Near-miss energy release reported.',
    sifProbability: '68%',
    chartData: [
      { day: 'Day 1', count: 1 }, { day: 'Day 5', count: 2 }, { day: 'Day 10', count: 5 },
      { day: 'Day 15', count: 8 }, { day: 'Day 20', count: 12 }, { day: 'Day 25', count: 19 }
    ]
  },
  {
    step: 3,
    label: 'Today (Live Telemetry)',
    count: 31,
    momentum: '+31.4%',
    status: 'ESCALATING SIF PRECURSOR',
    statusColor: 'var(--red-critical)',
    narrative: 'CRITICAL ESCALATION: 31 precursor observations correlate Energy Isolation failures at Duliajan. Imminent fatality risk if chain is not broken.',
    sifProbability: '94.6%',
    chartData: [
      { day: 'Day 1', count: 1 }, { day: 'Day 5', count: 2 }, { day: 'Day 10', count: 5 },
      { day: 'Day 15', count: 8 }, { day: 'Day 20', count: 12 }, { day: 'Day 25', count: 19 }, { day: 'Day 30', count: 31 }
    ]
  }
]

export default function SafetyTimeMachine() {
  const [currentStep, setCurrentStep] = useState(3)
  const current = TIMELINE_DATA[currentStep]

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <History size={12} />
          <span>OIL INDIA LIMITED • TEMPORAL INTELLIGENCE</span>
        </div>
        <h2>Safety Time Machine (Temporal Precursor Replay)</h2>
        <p>Replay and forecast the temporal escalation of precursor chains to detect risk acceleration before incidents occur</p>
      </div>

      {/* Interactive Time Slider */}
      <div className="timeline-slider-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="stat-label">TEMPORAL REPLAY POSITION</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cyan-ai)' }}>{current.label}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: current.statusColor, fontWeight: 700 }}>
            ● {current.status}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentStep}
          onChange={e => setCurrentStep(parseInt(e.target.value))}
          className="timeline-slider"
        />

        <div className="timeline-ticks">
          {TIMELINE_DATA.map((t, i) => (
            <span
              key={i}
              className={i === currentStep ? 'timeline-tick-active' : ''}
              onClick={() => setCurrentStep(i)}
              style={{ cursor: 'pointer' }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Trajectory Breakdown */}
      <div className="charts-grid">
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Precursor Frequency Acceleration Curve</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: current.statusColor }}>
              MOMENTUM: {current.momentum}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={current.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B323D" />
              <XAxis dataKey="day" tick={{ fill: '#8EA3AD', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              <YAxis tick={{ fill: '#8EA3AD', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              <Tooltip contentStyle={{ background: '#0F1F27', border: '1px solid #1B323D', color: '#E8F1F5', fontFamily: 'var(--font-mono)' }} />
              <Area type="monotone" dataKey="count" stroke={current.statusColor} fill={current.statusColor} fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-elevated">
          <div className="input-label" style={{ color: 'var(--cyan-ai)' }}>Temporal Chain Assessment</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E8F1F5', margin: '8px 0 14px' }}>
            Energy Isolation Precursor Trajectory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div className="stat-label">Accumulated Logs</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: '#E8F1F5' }}>{current.count}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div className="stat-label">Estimated SIF Risk</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: current.statusColor }}>{current.sifProbability}</div>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: '#E8F1F5', lineHeight: 1.6, background: 'var(--bg-deep)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            {current.narrative}
          </p>
        </div>
      </div>
    </div>
  )
}
