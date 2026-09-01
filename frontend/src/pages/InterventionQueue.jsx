import { useState } from 'react'
import { ShieldAlert, ArrowRight, CheckCircle2, TrendingUp, AlertOctagon, Sliders, ExternalLink } from 'lucide-react'

const QUEUE_ITEMS = [
  {
    id: '01',
    severity: 'critical',
    title: 'Energy Isolation / LOTO Verification Failure',
    site: 'Duliajan Central Complex',
    reportsCount: 47,
    momentum: '↑ 31.4%',
    hazard: 'High-Pressure Hydrocarbon & Electrical Isolation',
    suggestedAction: 'Initiate Urgent Field LOTO Audit & Zero-Energy Test Protocol',
    status: 'ACTION REQUIRED',
  },
  {
    id: '02',
    severity: 'critical',
    title: 'Hot Work Cutting Near Flammable Condensate',
    site: 'Digboi Refinery Unit #2',
    reportsCount: 38,
    momentum: '↑ 18.2%',
    hazard: 'Vapor Ignition & Fire Watch Absence',
    suggestedAction: 'Mandate Continuous Gas Detector Badges on All Welders',
    status: 'ACTION REQUIRED',
  },
  {
    id: '03',
    severity: 'high',
    title: 'Suspended Drill Pipe String Exposure on Rig Floor',
    site: 'Moran Drilling Rig #4',
    reportsCount: 29,
    momentum: '↑ 9.5%',
    hazard: 'Kinetic Crush & Hoist Rigging Breach',
    suggestedAction: 'Re-Establish Physical Red Zone Interlocks During Derrick Lifts',
    status: 'UNDER REVIEW',
  },
  {
    id: '04',
    severity: 'high',
    title: 'Confined Space Atmosphere Testing Omission',
    site: 'Naharkatiya Gas Plant',
    reportsCount: 22,
    momentum: '↑ 8.0%',
    hazard: 'Nitrogen Purge Asphyxiation',
    suggestedAction: 'Implement Standby Rescue Attendant Verification Log',
    status: 'UNDER REVIEW',
  }
]

export default function InterventionQueue() {
  const [items, setItems] = useState(QUEUE_ITEMS)
  const [actionTaken, setActionTaken] = useState({})

  const handleAction = (id) => {
    setActionTaken(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <ShieldAlert size={12} />
          <span>OIL INDIA LIMITED • DECISION-SUPPORT INTERVENTION QUEUE</span>
        </div>
        <h2>Intervention Queue (Action Triage)</h2>
        <p>Prioritized operational interventions targeting systemic precursor momentum before incidents manifest</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item) => {
          const isDone = actionTaken[item.id]

          return (
            <div key={item.id} className={`queue-card ${item.severity}`}>
              <div style={{ flex: 1, paddingLeft: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: 'var(--cyan-ai)' }}>
                    #{item.id}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {item.title}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: item.severity === 'critical' ? 'var(--red-critical)' : 'var(--amber-warn)' }}>
                    ● MOMENTUM: {item.momentum}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', margin: '8px 0' }}>
                  <span>FACILITY: <strong style={{ color: 'var(--cyan-ai)' }}>{item.site}</strong></span>
                  <span>PRECURSORS: <strong style={{ color: 'var(--red-critical)' }}>{item.reportsCount} LOGS</strong></span>
                  <span>HAZARD: <strong style={{ color: 'var(--text-primary)' }}>{item.hazard}</strong></span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-deep)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color)', marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--amber-warn)', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Intervention: </span>
                  {item.suggestedAction}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 20 }}>
                <button
                  className="analyze-btn"
                  style={{
                    padding: '8px 18px',
                    fontSize: 12,
                    background: isDone ? 'var(--emerald-safe)' : 'linear-gradient(135deg, var(--red-critical), #B91C1C)',
                    color: '#fff',
                    margin: 0
                  }}
                  onClick={() => handleAction(item.id)}
                >
                  {isDone ? '✓ INTERVENTION DISPATCHED' : 'DISPATCH AUDIT'}
                </button>
                <a
                  href="/simulator"
                  className="btn-action-outline"
                  style={{ textAlign: 'center', textDecoration: 'none', padding: '6px 14px', borderColor: 'var(--violet-sim)', color: 'var(--violet-sim)' }}
                >
                  <Sliders size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Simulate
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
