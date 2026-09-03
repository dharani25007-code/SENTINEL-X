import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'
import { FlaskConical } from 'lucide-react'

export default function InterventionSimulator() {
  const [lotoCompliance, setLotoCompliance] = useState(52)
  const [gasTestingRigor, setGasTestingRigor] = useState(48)
  const [exclusionZoneRigor, setExclusionZoneRigor] = useState(45)
  const [liveBaseRisk, setLiveBaseRisk] = useState(87.0)

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        if (data && data.sif_density > 0) {
          setLiveBaseRisk(data.sif_density)
        }
      })
      .catch(() => {})
  }, [])

  // Counterfactual simulated SIF risk calculation model
  const baseRisk = liveBaseRisk
  const lotoImpact = ((lotoCompliance - 52) / 48) * 28
  const gasImpact = ((gasTestingRigor - 48) / 52) * 20
  const zoneImpact = ((exclusionZoneRigor - 45) / 55) * 16
  const simulatedRisk = Math.max(12.0, Math.round((baseRisk - lotoImpact - gasImpact - zoneImpact) * 10) / 10)
  const riskReduction = Math.round((baseRisk - simulatedRisk) * 10) / 10

  return (
    <div>
      <div className="page-header">
        <div className="topic-pill">
          <FlaskConical size={12} />
          <span>OIL INDIA LIMITED • COUNTERFACTUAL SAFETY SIMULATOR</span>
        </div>
        <h2>Intervention Simulator (What-If Engine)</h2>
        <p>Model-based scenario estimation: simulate how strengthening specific safety barriers disrupts the precursor chain</p>
      </div>

      <div className="simulator-panel">
        {/* Levers Card */}
        <div className="sim-lever-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Safety Barrier Intervention Levers</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-ai)' }}>SCENARIO: MODEL ESTIMATE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Lever 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="input-label" style={{ margin: 0 }}>Enforce 100% LOTO Zero-Energy Test</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan-ai)', fontWeight: 700 }}>
                  {lotoCompliance}% Compliance
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={lotoCompliance}
                onChange={e => setLotoCompliance(parseInt(e.target.value))}
                className="timeline-slider"
                style={{ margin: '4px 0' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Baseline: 52% (Field logs show manual override risks during turnaround)</span>
            </div>

            {/* Lever 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="input-label" style={{ margin: 0 }}>Mandatory Continuous Hydrocarbon Gas Testing</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--amber-warn)', fontWeight: 700 }}>
                  {gasTestingRigor}% Compliance
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={gasTestingRigor}
                onChange={e => setGasTestingRigor(parseInt(e.target.value))}
                className="timeline-slider"
                style={{ margin: '4px 0' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Baseline: 48% (Near-misses logged during welding near condensate lines)</span>
            </div>

            {/* Lever 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="input-label" style={{ margin: 0 }}>Automated Crane Red Exclusion Zone Enforcement</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--emerald-safe)', fontWeight: 700 }}>
                  {exclusionZoneRigor}% Compliance
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={exclusionZoneRigor}
                onChange={e => setExclusionZoneRigor(parseInt(e.target.value))}
                className="timeline-slider"
                style={{ margin: '4px 0' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Baseline: 45% (Suspended drill string interactions on rig floor)</span>
            </div>
          </div>
        </div>

        {/* Counterfactual Results Card */}
        <div className="sim-comparison-card">
          <div className="input-label" style={{ color: 'var(--cyan-ai)' }}>SIMULATED HAZARD INTERCEPTION</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 16px' }}>
            Counterfactual Risk Profile
          </h3>

          <div className="sim-metric-comparison">
            <div className="sim-metric-box before">
              <div className="stat-label" style={{ color: 'var(--red-critical)' }}>CURRENT SIF RISK</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, color: 'var(--red-critical)' }}>
                {baseRisk}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--red-critical)', marginTop: 4, fontWeight: 700 }}>CRITICAL PRECURSOR</div>
            </div>

            <div className="sim-metric-box after">
              <div className="stat-label" style={{ color: 'var(--emerald-safe)' }}>SIMULATED RISK</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, color: 'var(--emerald-safe)' }}>
                {simulatedRisk}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--emerald-safe)', marginTop: 4, fontWeight: 700 }}>MANAGED STATE</div>
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--bg-deep)', borderRadius: 0, border: '1px solid var(--border-color)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Estimated Risk Interception:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--cyan-ai)' }}>-{riskReduction}%</strong>
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'left' }}>
            *Disclaimer: Counterfactual scenario estimates are derived from multi-barrier reliability weights and indicate relative risk reduction potential, not deterministic guarantees.
          </p>
        </div>
      </div>
    </div>
  )
}
